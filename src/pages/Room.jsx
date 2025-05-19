import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import useWebRTCStore from "../store/connectionStore";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { ModeToggle } from "@/components/mode-toggle";
import ChatPanel from "@/components/Chat-Panel";
import VideoLocal from "@/components/Video-local";
import VideoRemote from "@/components/Video-remote";
import { FileUpload } from "@/components/File-upload";
import { Info, MessageSquare, PhoneOff } from 'lucide-react';
import logo from "../assets/logo.svg"
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseconfig";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";



const getConnectionStatusColor = (status) => {
    switch (status) {
        case 'connected':
            return 'bg-green-500'; // Green dot
        case 'disconnected':
        case 'failed':
            return 'bg-red-500'; // Red dot
        case 'connecting':
            return 'bg-yellow-500'; // Yellow dot
        default:
            return 'bg-gray-500'; // Default gray dot if unknown status
    }
};
const audio = new Audio('/preview.mp3');
export default function Room() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const messagesEndRef = useRef(null);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [newMessageNotification, setNewMessageNotification] = useState(false); // Notification state
    const [fileAbortTrigger, setFileAbortTrigger] = useState(false); // Trigger for file abort
    const [showEndCallDialog, setShowEndCallDialog] = useState(false);



    // --- State from Zustand Store ---
    const connection = useWebRTCStore(state => state.connection);
    const role = useWebRTCStore(state => state.role);
    const connectionStatus = useWebRTCStore(state => state.connectionStatus);
    const dataChannel = useWebRTCStore(state => state.dataChannel);
    const incomingFileMeta = useWebRTCStore((s) => s.incomingFileMeta);
    const setIncomingFileMeta = useWebRTCStore((s) => s.setIncomingFileMeta);
    const fileTransferChannel = useWebRTCStore(state => state.fileTransferChannel);
    const localStream = useWebRTCStore(state => state.localStream);
    const remoteStream = useWebRTCStore(state => state.remoteStream);
    const resetState = useWebRTCStore(state => state.resetState);
    const isMobile = useWebRTCStore(state => state.isMobile);



    // --- Effects ---
    useEffect(() => {
        // Redirect if connection or role isn't set
        if (!connection || !role) {
            alert("Peer left. Redirecting to home.");
            navigate("/");
        }
    }, [connection, role, navigate]);


    useEffect(() => {
        const checker = async () => {
            const roomRef = doc(db, "rooms", roomId);

            if (connectionStatus === 'connected') {
                await setDoc(roomRef, { connectionStatus: 'connected' }, { merge: true })
            } else {
                await setDoc(roomRef, { connectionStatus: 'disconnected' }, { merge: true })

            }
        }
        checker();
    }, [connectionStatus]);


    useEffect(() => {
        const roomRef = doc(db, "rooms", roomId);

        const interval = setInterval(() => {
            updateDoc(roomRef, {
                lastSeen: Date.now(),
                connectionStatus: "connected",
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [roomId]);

    useEffect(() => {
        if (dataChannel) {
            const handleMessage = (event) => {
                let handled = false;

                try {
                    const parsed = JSON.parse(event.data);
                    if (parsed?.type === "video") return;

                    if (parsed?.type === "file-meta") {
                        setMessages(prev => [
                            ...prev,
                            {
                                type: "file-meta",
                                name: parsed.name,
                                size: parsed.size,
                                fileType: parsed.fileType,
                                sender: parsed.sender,
                                timestamp: new Date().toLocaleTimeString()
                            }
                        ]);
                        handled = true;
                    } else if (parsed?.type === "file-aborted") {
                        toast.error("File transfer aborted");
                        setFileAbortTrigger(true);
                        return;
                    }
                } catch {
                    const raw = event.data?.trim();
                    if (raw) {
                        setMessages(prev => [
                            ...prev,
                            {
                                text: raw,
                                sender: "remote",
                                timestamp: new Date().toLocaleTimeString()
                            }
                        ]);
                        handled = true;
                    }
                }

                if (handled && !isChatOpen) {
                    setNewMessageNotification(true);
                    audio.play(); // 🔊 Play sound
                }
            };


            dataChannel.addEventListener("message", handleMessage);
            return () => dataChannel.removeEventListener("message", handleMessage);
        }
    }, [dataChannel, isChatOpen]);



    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- Handlers ---
    const handleEndCall = () => {
        try {
            if (localStream) {
                localStream.getTracks().forEach((track) => track.stop());
            }
            if (remoteStream) {
                remoteStream.getTracks().forEach((track) => track.stop());
            }

            if (dataChannel && dataChannel.readyState === "open") {
                dataChannel.close();
            }
            if (fileTransferChannel && fileTransferChannel.readyState === "open") {
                fileTransferChannel.close();
            }

            if (connection) {
                connection.onicecandidate = null;
                connection.ontrack = null;
                connection.onconnectionstatechange = null;
                connection.oniceconnectionstatechange = null;
                connection.onsignalingstatechange = null;
                connection.ondatachannel = null;
                connection.close();
            }

            resetState();
            navigate("/");
        } catch (err) {
            console.error("Error during cleanup:", err);
        }
    };



    const sendMessage = () => {
        const trimmedMessage = inputMessage.trim();

        if (!dataChannel || dataChannel.readyState !== "open") {
            toast.error("Message channel not open. Retry connection.");
            return;
        }

        if (trimmedMessage === "") return;

        dataChannel.send(trimmedMessage);
        setMessages(prev => [
            ...prev,
            {
                text: trimmedMessage,
                sender: "local",
                timestamp: new Date().toLocaleTimeString()
            }
        ]);
        setInputMessage("");
    };

    const acceptFile = () => {
        fileTransferChannel?.send(JSON.stringify({ type: "file-accept" }));
        setIncomingFileMeta(null);
    };

    const rejectFile = () => {
        fileTransferChannel?.send(JSON.stringify({ type: "file-reject" }));
        setIncomingFileMeta(null);
    };


    const renderMainContent = () => (
        <Card className="flex-1 p-2 md:p-4 overflow-y-auto h-full bg-transparent">
            <div className="md:grid md:grid-cols-[2fr_1fr] md:gap-4 md:p-4 md:h-full">
                <div className="rounded-xl p-2 flex items-center justify-center h-fit md:h-auto">
                    <VideoRemote remoteStream={remoteStream} />
                </div>
                <div className="flex flex-col gap-4 md:h-full">
                    <div className="rounded-xl p-2 md:h-1/2">
                        <VideoLocal localStream={localStream} isMicOn={false} isCameraOn={false} />
                    </div>
                    <div className="rounded-xl p-2 h-1/2 md:h-full overflow-y-auto">
                        <FileUpload
                            onMetaSent={(meta) =>
                                setMessages(prev => [
                                    ...prev,
                                    {
                                        ...meta,
                                        sender: "remote",
                                        timestamp: new Date().toLocaleTimeString(),
                                    }
                                ])
                            }
                            fileAbortTrigger={fileAbortTrigger}
                            setFileAbortTrigger={setFileAbortTrigger}
                            audio={audio}
                        />
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="flex flex-col h-screen">
            <div className="flex flex-wrap items-center justify-between p-4 border-b flex-shrink-0">
                <div className="flex items-center gap-4">
                    <img src={logo} alt="Logo" className="h-8 w-auto" />
                    <div className="text-lg font-semibold">PeerShare</div>
                    <div className="text-lg font-semibold">Room: {roomId}</div>

                </div>
                <div className="flex items-center gap-4 mt-2 md:mt-0">
                    <span className="flex items-center justify-center gap-1">
                        {!isMobile && <strong>status: {connectionStatus}</strong>}
                        <span className={`w-3 h-3 mb-1 md:mb-0 rounded-full ${getConnectionStatusColor(connectionStatus)}`} />
                    </span>
                </div>
                <div className="flex items-center justify-center w-full md:w-auto gap-4 mt-2 md:mt-0">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex items-center justify-center">
                                <Info />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Room Info</DialogTitle>
                            </DialogHeader>
                            <DialogDescription asChild>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 text-primary">Important Information:</h3>
                                    <ul className="list-disc ml-4 text-sm text-primary">
                                        <li><strong>Room Destruction:</strong> If any one user leaves the room, the room is completely destroyed and cannot be reconnected. A new room must be created.</li>
                                        <li><strong>Custom Room:</strong> If you’re in a custom room and someone leaves, the same room name will be unavailable for 30 seconds. You’ll have to wait to rejoin.</li>
                                        <li><strong>Page Refresh:</strong> Refreshing the page will disconnect you and destroy the current room. Please avoid refreshing during an active session.</li>
                                        <li><strong>File Transfer Speed:</strong> File transfer speed may vary depending on geographical locations of the users.</li>
                                        <li><strong>Device Compatibility:</strong> For the best experience, use the latest version of Chrome or Firefox on desktop. Mobile support is limited.</li>
                                        <li><strong>Privacy:</strong> No data is stored on servers. All file and message transfers are peer-to-peer and encrypted.</li>
                                        <li><strong>Report a Bug:</strong> If you encounter any issues, please report them through our <a href="/report-bug" target="_blank" className="text-blue-600 underline">Report an issue</a>.</li>
                                    </ul>
                                </div>

                            </DialogDescription>
                            <DialogFooter className="sm:justify-start">
                                <DialogClose asChild>
                                    <Button variant="primary">Close</Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <ModeToggle />
                    <Button title={isChatOpen ? "Hide Chat" : "Show Chat"} onClick={() => {
                        setIsChatOpen((prev) => {
                            const newState = !prev;
                            if (newState) setNewMessageNotification(false); // Clear notification
                            return newState;
                        });
                    }}
                        className={`relative p-2 rounded-md transition-colors duration-200 ${isChatOpen ? "bg-[#DD2C00] text-white" : "bg-primary"
                            }`}
                    >
                        <MessageSquare className="w-5 h-5" />

                        {/* Notification Dot */}
                        {newMessageNotification && !isChatOpen && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                        )}
                        {newMessageNotification && !isChatOpen && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                        )}
                    </Button>


                    <AlertDialog open={showEndCallDialog} onOpenChange={setShowEndCallDialog}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" title="End Call">
                                <PhoneOff />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>End the call?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will disconnect you and the peer. Are you sure you want to leave the room?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleEndCall}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    End Call
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {!isMobile ? (
                    // DESKTOP VIEW - Both panels visible with resizing
                    <ResizablePanelGroup direction="horizontal" className="h-full">
                        <ResizablePanel defaultSize={75} minSize={70} className="p-4">
                            {renderMainContent()}
                        </ResizablePanel>
                        <ResizableHandle withHandle />
                        <ResizablePanel
                            defaultSize={25}
                            minSize={20}
                            className={`border-r h-full p-1 transition-all duration-300 ${isChatOpen ? 'block' : 'hidden'}`}
                        >
                            <ChatPanel
                                messages={messages}
                                inputMessage={inputMessage}
                                sendMessage={sendMessage}
                                setInputMessage={setInputMessage}
                                acceptFile={acceptFile}
                                rejectFile={rejectFile}
                            />
                        </ResizablePanel>
                    </ResizablePanelGroup>
                ) : (
                    // MOBILE VIEW - Use CSS for showing/hiding instead of unmounting
                    <div className="h-full relative">
                        {/* Main content always rendered but hidden when chat is open */}
                        <div
                            className={`p-2 h-full overflow-y-auto transition-opacity duration-300 ${isChatOpen ? 'opacity-0 absolute inset-0 pointer-events-none' : 'opacity-100'
                                }`}
                        >
                            {renderMainContent()}
                        </div>

                        {/* Chat panel always rendered but hidden when chat is closed */}
                        <div
                            className={`h-full transition-opacity duration-300 ${isChatOpen ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
                                }`}
                        >
                            <ChatPanel
                                messages={messages}
                                inputMessage={inputMessage}
                                sendMessage={sendMessage}
                                setInputMessage={setInputMessage}
                                acceptFile={acceptFile}
                                rejectFile={rejectFile}
                            />
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}