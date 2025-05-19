import React, { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Mic, MicOff, MonitorUp, User, StopCircle } from "lucide-react";
import useWebRTCStore from "@/store/connectionStore";
import { toast } from "sonner";

const VideoLocal = ({ localStream }) => {
    const videoEnabled = useWebRTCStore(state => state.videoEnabled);
    const audioEnabled = useWebRTCStore(state => state.audioEnabled);
    const localVideoRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(videoEnabled);
    const [isMicOn, setIsMicOn] = useState(audioEnabled);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
    const setLocalStream = useWebRTCStore(state => state.setLocalStream);
    const dataChannel = useWebRTCStore(state => state.dataChannel);
    const connection = useWebRTCStore(state => state.connection);
    const isMobile = useWebRTCStore(state => state.isMobile);

    // Store original camera stream reference
    const cameraStreamRef = useRef(null);

    useEffect(() => {
        setIsCameraOn(videoEnabled);
    }, [videoEnabled]);

    useEffect(() => {
        setIsMicOn(audioEnabled);
    }, [audioEnabled]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, isCameraOn]);

    // Listen for remote screen sharing state
    useEffect(() => {
        if (!dataChannel) return;

        const handleMessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "screenShare") {
                    setIsRemoteScreenSharing(message.enabled);
                }
            } catch (e) {
                // Ignore non-JSON messages
            }
        };

        dataChannel.addEventListener("message", handleMessage);
        return () => dataChannel.removeEventListener("message", handleMessage);
    }, [dataChannel]);

    const requestMediaIfNeeded = async () => {
        if (!localStream) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setLocalStream(stream);
                // Store the camera stream for later reference
                cameraStreamRef.current = stream;
                return stream;
            } catch (err) {
                toast("Camera and Microphone access is required to use this feature.");
                return null;
            }
        }
        return localStream;
    };

    const onToggleMedia = async (type) => {
        const stream = await requestMediaIfNeeded();
        if (!stream) return;

        if (type === "video") {
            const videoTrack = stream.getTracks().find(track => track.kind === 'video');
            if (videoTrack) {
                if (videoTrack.enabled) {
                    videoTrack.enabled = false;
                    localVideoRef.current.style.display = "hidden";
                } else {
                    videoTrack.enabled = true;
                    localVideoRef.current.style.display = "block";
                }
                useWebRTCStore.setState({ videoEnabled: videoTrack.enabled });
                if (dataChannel && dataChannel.readyState === "open") {
                    dataChannel.send(JSON.stringify({ type: "video", enabled: videoTrack.enabled }));
                }
            } else {
                toast("Video access is required to use this feature.");
            }
        } else if (type === "audio") {
            const audioTrack = stream.getTracks().find(track => track.kind === 'audio');
            if (audioTrack) {
                if (audioTrack.enabled) {
                    audioTrack.enabled = false;
                } else {
                    audioTrack.enabled = true;
                }
                useWebRTCStore.setState({ audioEnabled: audioTrack.enabled });

                if (dataChannel && dataChannel.readyState === "open") {
                    dataChannel.send(JSON.stringify({ type: "audio", enabled: audioTrack.enabled }));
                }
            } else {
                toast("Microphone access is required to use this feature.");
            }
        }
    };

    const handleScreenShare = async () => {
        // If already screen sharing, stop it

        if (isScreenSharing) {
            stopScreenShare();
            return;
        }

        // Prevent screen sharing if remote user is already sharing
        if (isRemoteScreenSharing) {
            toast("Cannot share screen while the other person is sharing their screen.");
            return;
        }

        try {
            // Make sure we have the original camera stream saved
            if (!cameraStreamRef.current && localStream) {
                cameraStreamRef.current = localStream;
            }

            // Get screen sharing stream
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: "always",
                    displaySurface: "monitor",
                },
                audio: false, // Usually screen share doesn't include audio
            });

            // Handle when user stops screen sharing via browser UI
            screenStream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

            // Replace the video track in the RTCPeerConnection
            if (connection) {
                const videoSender = connection.getSenders().find(sender =>
                    sender.track && sender.track.kind === "video"
                );

                if (videoSender) {
                    await videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
                }
            }

            // Show screen share in the local video element
            if (localVideoRef.current) {
                // Create a new stream that combines audio from camera and video from screen
                const combinedStream = new MediaStream();

                // Add screen video track
                screenStream.getVideoTracks().forEach(track => {
                    combinedStream.addTrack(track);
                });

                // Add audio tracks from original stream if they exist
                if (cameraStreamRef.current) {
                    cameraStreamRef.current.getAudioTracks().forEach(track => {
                        const clonedTrack = track.clone();
                        // Preserve the enabled state from the original track
                        clonedTrack.enabled = track.enabled;
                        combinedStream.addTrack(clonedTrack);
                    });
                }

                // Set the combined stream as local stream
                localVideoRef.current.srcObject = combinedStream;
                setLocalStream(combinedStream);
            }

            // Send signal to peers that we're screen sharing
            if (dataChannel && dataChannel.readyState === "open") {
                dataChannel.send(JSON.stringify({ type: "screenShare", enabled: true }));
            }

            setIsScreenSharing(true);
        } catch (err) {
            if (err.name === 'NotAllowedError') {
                toast.info("User denied screen share permission");
            }
        }
    };

    const stopScreenShare = async () => {
        try {
            // Stop all screen share tracks
            if (localVideoRef.current && localVideoRef.current.srcObject) {
                localVideoRef.current.srcObject.getVideoTracks().forEach(track => {
                    track.stop();
                });
            }

            // Revert back to camera video in the peer connection
            if (connection && cameraStreamRef.current) {
                const videoSender = connection.getSenders().find(sender =>
                    sender.track && sender.track.kind === "video"
                );

                if (videoSender && cameraStreamRef.current.getVideoTracks()[0]) {
                    await videoSender.replaceTrack(cameraStreamRef.current.getVideoTracks()[0]);

                    // const currentVideoEnabled = useWebRTCStore.getState().videoEnabled;
                    // cameraStreamRef.current.getVideoTracks()[0].enabled = currentVideoEnabled;
                }
            }

            // Reset local video display back to camera
            if (localVideoRef.current && cameraStreamRef.current) {
                localVideoRef.current.srcObject = cameraStreamRef.current;
                setLocalStream(cameraStreamRef.current);
            }

            // Notify peers that screen sharing has ended
            if (dataChannel && dataChannel.readyState === "open") {
                dataChannel.send(JSON.stringify({ type: "screenShare", enabled: false }));
            }

            setIsScreenSharing(false);
        } catch (err) {
            console.error("Error stopping screen share:", err);
        }
    };

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden group bg-black">
            <div className="relative w-full h-full rounded-xl overflow-hidden group">
                <div className="relative w-full  rounded-xl overflow-hidden">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full  object-cover ${isCameraOn || isScreenSharing ? 'block' : 'hidden'}`}
                    />

                    {!isCameraOn && !isScreenSharing && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                            <User size={48} className="opacity-60" />
                        </div>
                    )}
                </div>


                {isScreenSharing && (
                    <div className="absolute top-2 left-2 bg-blue-600  text-sm px-2 py-1 rounded-md flex items-center">
                        <MonitorUp size={14} className="mr-1" />
                        <span>Screen Sharing</span>
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-4 flex gap-3 opacity-100 transition-opacity duration-300 ">
                <button
                    onClick={() => !isScreenSharing && onToggleMedia("video")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center  transition-colors
                            ${isScreenSharing ? "bg-zinc-700  cursor-not-allowed" :
                            isCameraOn ? "bg-muted text-primary" : "bg-destructive/80 text-destructive-foreground"}`}
                    title={isScreenSharing ? "Cannot toggle camera during screen sharing" : "Toggle Camera"}
                    disabled={isScreenSharing}
                >
                    {isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                </button>

                <button
                    onClick={() => onToggleMedia("audio")}
                    className={`w-10 h-10 rounded-full flex items-center justify-center  transition-colors
                            ${isMicOn ? "bg-muted text-primary" : "bg-destructive/80 text-destructive-foreground"}`}
                    title="Toggle Mic"
                >
                    {isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                </button>

                <button

                    onClick={handleScreenShare}
                    className={`w-10 h-10 rounded-full items-center justify-center border transition-colors
                                ${isMobile ? 'hidden' : 'flex'}
                                ${isScreenSharing ? "bg-blue-600 text-white" :
                            isRemoteScreenSharing ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" :
                                "bg-muted text-primary"}`}
                    title={isScreenSharing ? "Stop Sharing" :
                        isRemoteScreenSharing ? "Cannot share while other user is sharing" :
                            "Share Screen"}
                    disabled={isRemoteScreenSharing && !isScreenSharing}
                >
                    {isScreenSharing ? <StopCircle size={18} /> : <MonitorUp size={18} />}
                </button>
            </div>

            {/* Remote screen sharing indicator */}
            {isRemoteScreenSharing && !isScreenSharing && (
                <div className="absolute top-2 left-2 bg-indigo-600 text-white text-sm px-2 py-1 rounded-md flex items-center">
                    <MonitorUp size={14} className="mr-1" />
                    <span>Remote user is sharing screen</span>
                </div>
            )}
        </div>
    );
};

export default VideoLocal;