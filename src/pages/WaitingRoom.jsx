import { useEffect, useRef, useState } from "react";
import { VideoOff, MicOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import useWebRTCStore from "../store/connectionStore";
import { Clipboard } from "lucide-react";
import { toast } from "sonner";

export default function WaitingRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // Get state from Zustand store
    const connection = useWebRTCStore((state) => state.connection);
    const role = useWebRTCStore((state) => state.role);
    const connectionStatus = useWebRTCStore((state) => state.connectionStatus);
    const dataChannel = useWebRTCStore((state) => state.dataChannel);
    const resetState = useWebRTCStore((state) => state.resetState);

    // Refs for timers
    const timeoutRef = useRef(null);
    const connectedRef = useRef(false);

    // Copy room link to clipboard
    const copyRoomLink = () => {
        const roomLink = `${window.location.origin}/join-room/${roomId}`;
        navigator.clipboard.writeText(roomLink);
        toast.success("Room link copied to clipboard!", { duration: 1500, });
    };

    // Check if user is authorized as caller and monitor connection state
    useEffect(() => {
        if (role !== 'caller') {
            navigate('/');
            return;
        }

        // Function to check connection status and navigate if connected
        const checkConnectionAndNavigate = () => {


            // Check various states that indicate a successful connection
            const isConnected = connection && (
                connection.connectionState === 'connected' ||
                connection.iceConnectionState === 'connected' ||
                connection.iceConnectionState === 'completed'
            );

            if (isConnected && !connectedRef.current) {
                connectedRef.current = true; // Prevent multiple navigations
                navigate(`/room/${roomId}`);
            }
        };

        // Initial check
        checkConnectionAndNavigate();

        // Set up event listeners for connection state changes
        if (connection) {
            connection.addEventListener('connectionstatechange', checkConnectionAndNavigate);
            connection.addEventListener('iceconnectionstatechange', checkConnectionAndNavigate);
        }

        // Set a timeout to check connection status periodically
        const intervalId = setInterval(() => {
            checkConnectionAndNavigate();
        }, 1000);

        // Set a timeout for overall waiting time
        timeoutRef.current = setTimeout(() => {
            if (!connectedRef.current) {
                console.log("Still waiting for connection after timeout...");
            }
        }, 30000);

        return () => {
            // Clean up event listeners and timers
            if (connection) {
                connection.removeEventListener('connectionstatechange', checkConnectionAndNavigate);
                connection.removeEventListener('iceconnectionstatechange', checkConnectionAndNavigate);
            }

            clearInterval(intervalId);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [connection, role, roomId, navigate]);

    // Handle cancellation
    const handleCancel = () => {
        if (connection) {
            connection.close();
        }

        if (dataChannel && dataChannel.readyState === 'open') {
            dataChannel.close();
        }

        resetState();
        navigate("/");
    };

    return (
        <div className="pt-[80px] pb-20 p-4 min-h-screen flex justify-center items-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg md:text-2xl">Waiting for someone to join</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <p className="text-md mb-4 md:tex-xl">Share this link with someone to join your room</p>

                        <div className="flex flex-col items-center justify-around space-x-2 mb-6 md:flex-row">
                            <code className="bg-muted p-2 rounded w-full overflow-auto">
                                {`${window.location.origin}/join/${roomId}`}
                            </code>
                            <Button
                                variant="outline"
                                onClick={copyRoomLink}
                                className="mt-2 md:mt-0 w-full md:w-auto"
                            >
                                <Clipboard />
                            </Button>
                        </div>
                        {/* Device permissions prompt */}
                        <div className="flex flex-col items-center text-center bg-muted p-4 rounded">
                            <div className="flex space-x-4 text-3xl text-gray-500 mb-2">
                                <VideoOff className="w-8 h-8" />
                                <MicOff className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-primary">
                                Please allow access to your <strong>camera</strong> and <strong>microphone</strong> to continue.
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                (Camera and mic are initially off. You can turn them on after joining.)
                            </p>
                        </div>


                        <div className="my-2 md:my-6">
                            <p className="text-sm">Connection Status: </p>
                            <p className="text-sm font-semibold">{connectionStatus}</p>
                            {connectionStatus === "connected" && (
                                <p className="text-green-500 mt-2">
                                    Connection established! Redirecting to room...
                                </p>
                            )}
                        </div>

                        <div className="mt-5 w-full">
                            <Button variant="destructive" onClick={handleCancel} className="w-full">
                                Cancel
                            </Button>
                        </div>

                    </div>
                </CardContent>
                <p className="text-xs text-muted-foreground text-center pt-4">
                    By using Peer Share, you agree to our{" "}
                    <a href="/privacy-policy" target="_blank" className="underline hover:text-primary transition-colors">Privacy Policy</a> and{" "}
                    <a href="/terms-of-service" className="underline hover:text-primary transition-colors">Terms & Conditions</a>.
                </p>

            </Card>
        </div>
    );
}