import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Upload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import useWebRTCStore from "@/store/connectionStore";
import { Button } from "./ui/button";


const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

export const FileUpload = ({ onChange, onMetaSent, fileAbortTrigger, setFileAbortTrigger, audio }) => {
  const [file, setFile] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // Timer state
  const [isWaiting, setIsWaiting] = useState(false); // Track sending status
  const [progress, setProgress] = useState(0); // File send progress
  const [isAccepted, setIsAccepted] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false); // Track receiving status
  const [displayFile, setDisplayFile] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);

  const fileInputRef = useRef(null);
  let reader = useRef(null);
  const receiveBuffer = useRef([]); // Buffer for incoming messages
  const receivedSize = useRef(0); // Size of the received file
  const timerId = useRef(null); // Store timer reference
  const fileToSendRef = useRef(null);
  const fileMeta = useRef(null); // Store file metadata
  const currentTransferId = useRef(null);
  const incomingFileMeta = useWebRTCStore((s) => s.incomingFileMeta);
  const setIncomingFileMeta = useWebRTCStore((s) => s.setIncomingFileMeta);
  const fileTransferChannel = useWebRTCStore((state) => state.fileTransferChannel);

  useEffect(() => {
    if (isReceiving && fileMeta.current) setDisplayFile(fileMeta.current);
    if (file) {
      fileToSendRef.current = file;
      setDisplayFile(file);
    } else if (!file && !fileToSendRef.current && !isReceiving) {
      setDisplayFile(null);
    }
  }, [file, isReceiving]);

  useEffect(() => {
    if (fileAbortTrigger) handleRemove();
  }, [fileAbortTrigger]);

  useEffect(() => {
    if (!fileTransferChannel) return;

    fileTransferChannel.addEventListener("message", listener);

    return () => {
      fileTransferChannel.removeEventListener("message", listener);
      if (timerId.current) {
        clearInterval(timerId.current);
      }
    };
  }, [fileTransferChannel]);

  useEffect(() => {
    const handlePaste = (e) => {
      const fileToSend = fileToSendRef.current; 

      if (file || fileToSend || isReceiving || incomingFileMeta) {
        e.preventDefault();
        return;
      }

      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFile = e.clipboardData.files[0];
        handleFileChange([pastedFile]);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [file, isReceiving, incomingFileMeta]); 


  const generateTransferId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleFileChange = (newFiles) => {
    if (!newFiles || newFiles.length === 0) {
      console.warn("No files were selected");
      return;
    }

    const selectedFile = newFiles[0];
    fileToSendRef.current = selectedFile; // Store in ref for persistence
    setFile(selectedFile);
    resetTimer();
    setProgress(0); // Reset progress when a new file is selected
    setIsWaiting(false); // Reset waiting state
    setIsAccepted(false); // Reset acceptance state
    onChange && onChange(selectedFile);
  };

  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    if (file || fileToSendRef.current || isReceiving || incomingFileMeta) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const listener = async (event) => {
    try {
      if (typeof event.data === 'string') {

        const msg = JSON.parse(event.data);
        if (msg.type === "file-meta") {
          console.log("📁 Incoming file meta received:");
          await setIncomingFileMeta({
            name: msg.name,
            size: msg.size,
            mime: msg.mime,
            transferId: msg.transferId,
          });

          fileMeta.current = msg;
          currentTransferId.current = msg.transferId;
          setIsCanceled(false);
          audio.play();
        } else if (msg.type === "file-accept") {
          if (timerId.current) {
            clearInterval(timerId.current);
          }
          setIsWaiting(false);
          setIsAccepted(true);

          // Start sending file chunks
          startFileSending();

        } else if (msg.type === "file-reject") {
          if (timerId.current) {
            clearInterval(timerId.current);
          }
          setFile(null);
          fileToSendRef.current = null;
          setProgress(0);
          setIsWaiting(false);
          toast.error("Receiver rejected the file.");
        } else if (msg.type === "file-aborted") {
          if (msg.transferId === currentTransferId.current) {
            handleCancelTransfer();
            toast.info("File transfer was canceled by the other party.");
          }
        }
      } else {

        if (fileMeta.current === null) {
          toast.error("File metadata not received. Please try again.");
          resetFileTransfer();
          return;
        }
        if (isCanceled) {
          // If transfer is canceled, ignore incoming chunks
          console.log("Ignoring chunk because transfer was canceled");
          return;
        }
        if (!isReceiving) setIsReceiving(true); // Set receiving state

        receiveBuffer.current.push(event.data);
        receivedSize.current += event.data.byteLength;

        setProgress(Math.round((receivedSize.current / fileMeta.current.size) * 100));

        if (receivedSize.current === fileMeta.current.size) {

          const receivedBlob = new Blob(receiveBuffer.current, { type: fileMeta.current.mime });
          const fileURL = URL.createObjectURL(receivedBlob);

          // Create a temporary <a> element to trigger the download
          const link = document.createElement('a');
          link.href = fileURL;
          link.download = fileMeta.current.name; // Use the file name from incomingFileMeta
          document.body.appendChild(link); // Append the link to the DOM
          link.click(); // Programmatically trigger a click to download the file
          document.body.removeChild(link); // Clean up the link element from the DOM

          URL.revokeObjectURL(fileURL);
          // Reset buffer and size for next file transfer
          receiveBuffer.current = [];
          receivedSize.current = 0;
          const meta = {
            type: "file-meta",
            name: fileMeta.current.name,
            size: fileMeta.current.size,
            fileType: fileMeta.current.type,
            lastModified: fileMeta.current.lastModified
          };

          if (onMetaSent) onMetaSent(meta);
          resetFileTransfer();
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  };

  // Function to start sending file chunks
  const startFileSending = () => {
    const fileToSend = file || fileToSendRef.current;

    if (!fileToSend) {
      toast.error("Cannot send file: file is null.");
      return;
    }
    if (!fileTransferChannel || fileTransferChannel.readyState !== "open") {
      toast.error("Data channel is not available or not open");
      return;
    }

    const getOptimalChunkSize = (fileSize) => {
      if (fileSize < 1024 * 1024) return 8 * 1024; // 8KB for small files
      if (fileSize < 10 * 1024 * 1024) return 16 * 1024; // 16KB for medium files
      return 32 * 1024; // 32KB for large files
    };

    const chunkSize = getOptimalChunkSize(fileToSend.size);
    let offset = 0;
    fileTransferChannel.bufferedAmountLowThreshold = chunkSize * 6;

    const sendNextChunk = () => {
      if (isCanceled) {
        console.log("Stopping chunk sending because transfer was canceled");
        resetFileTransfer();
        return;
      }

      if (!fileTransferChannel || fileTransferChannel.readyState !== "open") {
        toast.error("Connection lost while sending file.");
        resetFileTransfer();
        return;
      }

      const chunk = fileToSend.slice(offset, offset + chunkSize);
      reader.current = new FileReader();

      reader.current.onload = (e) => {
        if (isCanceled) {
          console.log("Transfer was canceled during chunk read");
          resetFileTransfer();
          return;
        }

        const buffer = e.target.result;

        try {
          fileTransferChannel.send(buffer);

          // Update progress
          offset += buffer.byteLength;
          const percentComplete = Math.round((offset / fileToSend.size) * 100);
          setProgress(percentComplete);


          if (offset < fileToSend.size) {
            // If buffer is getting full, wait for bufferedamountlow event
            if (fileTransferChannel.bufferedAmount > fileTransferChannel.bufferedAmountLowThreshold) {
              fileTransferChannel.addEventListener("bufferedamountlow", sendNextChunk, { once: true });
            } else {
              setTimeout(sendNextChunk, 0);
            }
          } else {
            console.log("📁 File transfer complete");


            if (onMetaSent) onMetaSent({
              type: "file-meta",
              name: fileToSend.name,
              size: fileToSend.size,
              fileType: fileToSend.type,
              lastModified: fileToSend.lastModified
            });

            resetFileTransfer();
          }
        } catch (err) {
          console.error("Error sending chunk:", err);
          toast.error("Failed to send file chunk. Connection may be unstable.");
          resetFileTransfer();
        }
      };

      reader.current.onerror = (e) => {
        console.error("FileReader error:", e);
        toast.error("Error reading file chunk");
        resetFileTransfer();
      };

      reader.current.readAsArrayBuffer(chunk);
    };


    setTimeout(sendNextChunk, 10);

  };

  const handleSend = () => {
    // Use ref value as backup if state is null
    const fileToSend = file || fileToSendRef.current || fileMeta.current;

    if (!fileToSend) {
      toast.error("Cannot send: file is null");
      return;
    }
    if (!fileTransferChannel) {
      toast.error("Cannot send: fileTransferChannel is not available");
      return;
    }
    if (fileToSend.size === 0) {
      toast.info("File is empty. Please select a valid file.");
      return;
    }

    const transferId = generateTransferId();
    currentTransferId.current = transferId;
    setIsCanceled(false);

    const metaData = {
      type: "file-meta",
      name: fileToSend.name,
      size: fileToSend.size,
      mime: fileToSend.type,
      transferId: transferId, // Add transfer ID to metadata
    };
    fileTransferChannel.send(JSON.stringify(metaData));

    setIsWaiting(true); // Set waiting state

    // Start timer countdown
    const start = Date.now();
    timerId.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(30 - elapsed, 0);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timerId.current);
        setIsWaiting(false);
        toast.error("Request timed out. Receiver did not respond.");
      }
    }, 1000);

  };

  const handleCancelSignal = () => {
    if (!currentTransferId.current) return;

    try {
      if (fileTransferChannel && fileTransferChannel.readyState === "open") {

        fileTransferChannel.send(JSON.stringify({
          type: "file-aborted",
          transferId: currentTransferId.current
        }));

        // Mark as canceled locally
        setIsCanceled(true);
        toast.info("Transfer canceled");
        handleCancelTransfer();
      }
    } catch (error) {
      console.error("Error sending cancel message:", error);
    }
  };

  const handleRemove = () => {
    if ((isAccepted || isReceiving) && progress > 0 && progress < 100) {
      handleCancelSignal();
    } else {
      resetFileTransfer();
    }
  };
  const resetTimer = () => {
    if (timerId.current) clearInterval(timerId.current);
    timerId.current = null;
    setTimeLeft(30);
  };

  const handleCancelTransfer = () => {
    // Clean up FileReader if active
    if (reader.current) {
      reader.current.onload = null;
      reader.current.abort();
      reader.current = null;
    }

    setIsCanceled(true);
    resetTimer();

    // Don't reset everything immediately to allow UI to show cancellation state
    // Instead, delay the full reset
    setTimeout(() => {
      resetFileTransfer();
    }, 1000);
  };
  const resetFileTransfer = () => {

    setFile(null);
    fileToSendRef.current = null;
    fileMeta.current = null;
    receiveBuffer.current = [];
    receivedSize.current = 0;
    currentTransferId.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }


    setDisplayFile(null);
    setIsReceiving(false);
    setIsWaiting(false);
    setIsAccepted(false);
    setProgress(0);
    setIsCanceled(false);
    setFileAbortTrigger(false);
  };


  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: handleFileChange,
    onDropRejected: (error) => console.log("Drop rejected:", error),
  });


  return (
    <div className="w-full h-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full h-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={false}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFileChange([e.target.files[0]]);
            }
          }}
          className="hidden"
          accept="*/*"
        />

        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>

        <div className="flex flex-col items-center justify-center h-full">

          <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            Select, drag & drop, or paste a file
          </p>

          <div className="relative w-full h-full mt-8 max-w-xl mx-auto">
            {displayFile ? (
              <>
                <motion.div
                  layoutId="file-upload"
                  className={cn(
                    "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start h-50 p-2 md:h-50 md:p-4 md:mx-auto rounded-md",
                    "shadow-sm"
                  )}
                >
                  <div className="flex justify-between w-65 truncate items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {displayFile.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                    >
                      {(displayFile.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-65 mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
                    >
                      {displayFile.type}
                    </motion.p>
                  </div>
                  <div className="relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-35 p-4 mt-4 w-full mx-auto rounded-md shadow-sm">
                    <p className="text-base text-neutral-700 dark:text-neutral-300">
                      {isAccepted ? "Sending file..." : isReceiving ? "Receiving file..." : "Idle"}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Progress: {progress}%</p>
                    <div className="w-full mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#15D38B] h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                <div className="mt-6 flex justify-center gap-4" onClick={(e) => e.stopPropagation()}>
                  <Button
                    hidden={isReceiving}
                    onClick={handleSend}
                    disabled={isWaiting || isAccepted || incomingFileMeta}
                  >
                    {isWaiting ? `Waiting (${timeLeft}s)` : isAccepted ? "Sending..." : "Send"}
                  </Button>
                  <Button
                    onClick={handleRemove}
                    variant="destructive"
                    disabled={isWaiting}
                  >
                    {(isAccepted || isReceiving) && progress > 0 && progress < 100 ? "Cancel" : "Remove"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop it
                      <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                    </motion.p>
                  ) : (
                    <Upload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${index % 2 === 0
                ? "bg-gray-50 dark:bg-neutral-950"
                : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
                }`}
            />
          );
        })
      )}
    </div>
  );
}
