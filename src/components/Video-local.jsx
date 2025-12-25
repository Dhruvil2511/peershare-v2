import React, { useEffect, useRef, useState } from "react";
import { MonitorUp, User } from "lucide-react";
import useWebRTCStore from "@/store/connectionStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { randomColor } from "@/lib/utils";

const VideoLocal = ({ localStream }) => {
    const videoEnabled = useWebRTCStore(state => state.videoEnabled);
    const isScreenSharing = useWebRTCStore(state => state.isScreenSharing);
    const localVideoRef = useRef(null);
    const [isCameraOn, setIsCameraOn] = useState(videoEnabled);
    const [isRemoteScreenSharing, setIsRemoteScreenSharing] = useState(false);
    const dataChannel = useWebRTCStore(state => state.dataChannel);
    const localName = useWebRTCStore(state => state.localName);


    useEffect(() => {
        setIsCameraOn(videoEnabled);
    }, [videoEnabled]);


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
            } catch {
                // Ignore non-JSON messages
            }
        };

        dataChannel.addEventListener("message", handleMessage);
        return () => dataChannel.removeEventListener("message", handleMessage);
    }, [dataChannel]);


    return (
        <div className="relative w-full  rounded-xl overflow-hidden group bg-black">
            <div className="aspect-video relative w-full  rounded-xl overflow-hidden">
                <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full object-cover ${isCameraOn || isScreenSharing ? 'block' : 'hidden'}`}
                />

                {!isCameraOn && !isScreenSharing && (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Avatar className={`w-20 h-20 ${randomColor} p-2`}>
                            <AvatarImage src={`https://anonymous-animals.azurewebsites.net/animal/${localName.split(" ")[1]}`} />
                            <AvatarFallback><User size={48} /></AvatarFallback>
                        </Avatar>
                    </div>
                )}

                {isScreenSharing && (
                    <div className="absolute top-2 left-2 bg-blue-600  text-sm px-2 py-1 rounded-md flex items-center">
                        <MonitorUp size={14} className="mr-1" />
                        <span>Screen Sharing</span>
                    </div>
                )}
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