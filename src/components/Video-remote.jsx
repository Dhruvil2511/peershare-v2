import React, { useEffect, useRef, useState } from "react";
import { Maximize, Mic, MicOff, Minimize, User, MonitorUp, PictureInPicture, PictureInPicture2 } from "lucide-react";
import useWebRTCStore from "@/store/connectionStore";

const VideoRemote = ({ remoteStream }) => {
    const remoteVideoRef = useRef(null);
    const containerRef = useRef(null);
    const dataChannel = useWebRTCStore(state => state.dataChannel);
    const videoEnabled = useWebRTCStore(state => state.videoEnabled);
    const audioEnabled = useWebRTCStore(state => state.audioEnabled);
    const [remoteOff, setRemoteOff] = useState(!videoEnabled);
    const [remoteAudioOff, setRemoteAudioOff] = useState(!audioEnabled);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
    const [isPiP, setIsPiP] = useState(false);


    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, remoteOff, remoteAudioOff]);

    useEffect(() => {
        if (!dataChannel) return;

        const handleMessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === "video") {
                    if (!message.enabled) remoteVideoRef.current.style.display = "hidden";
                    else remoteVideoRef.current.style.display = "block";
                    setRemoteOff(!message.enabled);
                } else if (message.type === "audio") {
                    setRemoteAudioOff(!message.enabled);
                } else if (message.type === "screenShare") {
                    setIsRemoteScreenSharing(message.enabled);

                    // When screen sharing starts, ensure video is displayed
                    if (message.enabled) {
                        setRemoteOff(false);
                    }
                }
            } catch (e) {
                // Ignore non-JSON messages
            }
        };

        dataChannel.addEventListener("message", handleMessage);
        return () => dataChannel.removeEventListener("message", handleMessage);
    }, [dataChannel]);

    // Handle fullscreen changes from browser controls as well
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        const element = containerRef.current;
        if (!element) return;

        if (!document.fullscreenElement) {
            element.requestFullscreen().then(() => setIsFullscreen(true))
                .catch(err => console.error('Could not enter fullscreen mode:', err));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false))
                .catch(err => console.error('Could not exit fullscreen mode:', err));
        }
    };
    useEffect(() => {
        const onEnter = () => setIsPiP(true);
        const onLeave = () => setIsPiP(false);

        document.addEventListener("enterpictureinpicture", onEnter);
        document.addEventListener("leavepictureinpicture", onLeave);

        return () => {
            document.removeEventListener("enterpictureinpicture", onEnter);
            document.removeEventListener("leavepictureinpicture", onLeave);
        };
    }, []);


    // Optimize video display based on content
    const getVideoClassName = () => {
        // For screen sharing, we want to prioritize fitting content rather than covering
        if (isRemoteScreenSharing) {
            return "w-full h-full object-contain";
        }
        // For webcam video, we typically want to cover
        return "w-full h-full object-cover aspect-video";
    };

    const togglePiP = async () => {
        const video = remoteVideoRef.current;
        if (!video) return;

        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                setIsPiP(false);
            } else {
                await video.requestPictureInPicture();
                setIsPiP(true);
            }
        } catch (err) {
            toast.error("PiP toggle failed:", err);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-full bg-black rounded-xl  overflow-hidden flex items-center justify-center">
            {/* Remote audio indicator */}
            <div className={`absolute top-4 right-4 p-2 rounded-full z-10
                            ${!remoteAudioOff ? "bg-muted text-primary" : "bg-destructive/80 text-destructive-foreground"}`}>
                {remoteAudioOff ? (
                    <MicOff size={20} />
                ) : (<Mic size={20} />)}
            </div>

            {/* Screen sharing indicator */}
            {isRemoteScreenSharing && (
                <div className="absolute top-4 left-4 bg-blue-600  text-sm px-2 py-1 rounded-md flex items-center z-10">
                    <MonitorUp size={14} className="mr-1" />
                    <span>Screen Sharing</span>
                </div>
            )}

            <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
                {/* PiP Button */}
                <button
                    onClick={togglePiP}
                    className="p-2 rounded-full bg-muted text-primary hover:bg-primary hover:text-secondary transition"
                    title="Toggle Picture-in-Picture"
                >
                    {/* You can use Lucide icon or emoji fallback */}

                    <span className="text-[16px]">{isPiP ? <PictureInPicture size={20} /> : <PictureInPicture2 size={20} />}</span>
                </button>

                {/* Fullscreen Button */}
                <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-full bg-muted text-primary hover:bg-primary hover:text-secondary transition"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
            </div>


            {/* Video or fallback display */}
            <div className="relative w-full h-full ">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className={`${getVideoClassName()}`}
                />
                <div
                    className={`absolute top-0 left-0 w-full h-full flex items-center justify-center text-white  ${remoteOff ? '' : 'hidden'
                        }`}
                >
                    <User size={48} className="opacity-60" />
                </div>
            </div>

        </div>
    );
};

export default VideoRemote;