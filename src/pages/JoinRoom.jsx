import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { doc, getDoc, collection, addDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import iceconfig from "../config/iceconfig";
import useWebRTCStore from "../store/connectionStore";
import { VideoOff, MicOff, Mic, Camera } from "lucide-react";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { name } from "@/lib/utils";


export default function JoinRoom() {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState(null);
    const [enableCamera, setEnableCamera] = useState(true);
    const [enableMicrophone, setEnableMicrophone] = useState(true);

    // Access Zustand store
    const initializeCallee = useWebRTCStore(state => state.initializeCallee);
    const setConnectionStatus = useWebRTCStore(state => state.setConnectionStatus);
    const setDataChannel = useWebRTCStore(state => state.setDataChannel);
    const addPendingCandidate = useWebRTCStore(state => state.addPendingCandidate);
    const processPendingCandidates = useWebRTCStore(state => state.processPendingCandidates);
    const setLocalStream = useWebRTCStore(state => state.setLocalStream);
    const setRemoteStream = useWebRTCStore(state => state.setRemoteStream);
    const resetState = useWebRTCStore(state => state.resetState);
    const setFileTransferChannel = useWebRTCStore(state => state.setFileTransferChannel);
    const setLocalName = useWebRTCStore(state => state.setLocalName);

    // Handle joining the room
    const handleJoinRoom = async () => {
        setJoining(true);
        setError(null);

        try {
            // Check if room exists
            const roomRef = doc(db, "rooms", roomId);
            const roomSnapshot = await getDoc(roomRef);

            if (!roomSnapshot.exists()) {
                setError("Room not found. Please check the room ID.");
                setJoining(false);
                return;
            }

            const roomData = roomSnapshot.data();
            if (!roomData.offer) {
                setError("Invalid room data. No offer found.");
                setJoining(false);
                return;
            }
            if (roomData?.connectionStatus === "connected") {
                toast.error("Room is taken. Please try again later.");
                setJoining(false);
                return;
            }

            let mediaStream;
            try {
                // Only request the media types that are enabled
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: enableCamera,
                    audio: enableMicrophone
                });
                setLocalStream(mediaStream);
            } catch (error) {
                toast.error("Error accessing media devices.");
            }
            // Create peer connection
            const peerConnection = new RTCPeerConnection(iceconfig);

            mediaStream?.getTracks().forEach(track => {
                peerConnection.addTrack(track, mediaStream);
            });

            // Set initial track states based on user preferences
            mediaStream?.getVideoTracks().forEach(track => { track.enabled = false });
            mediaStream?.getAudioTracks().forEach(track => (track.enabled = false));

            peerConnection.ontrack = event => {
                setRemoteStream(event.streams[0]);
            };

            // Initialize as callee in store
            initializeCallee(peerConnection, roomId);

            // Setup connection event listeners
            peerConnection.addEventListener('connectionstatechange', () => {
                if (peerConnection.connectionState === 'connected') {
                    setConnectionStatus("connected");
                } else if (peerConnection.connectionState === 'disconnected') {
                    setConnectionStatus("disconnected");
                } else if (peerConnection.connectionState === 'failed') {
                    setConnectionStatus("failed");
                } else {
                    setConnectionStatus(`ℹ️ State: ${peerConnection.connectionState}`);
                }
            });

            peerConnection.addEventListener('iceconnectionstatechange', () => {
                if (peerConnection.iceConnectionState === 'connected') {
                    setConnectionStatus("ice-connected");
                } else if (peerConnection.iceConnectionState === 'checking') {
                    setConnectionStatus("ice-checking");
                } else if (peerConnection.iceConnectionState === 'failed') {
                    setConnectionStatus("ice-failed");
                }
            });

            // Handle data channel
            peerConnection.ondatachannel = (event) => {
                const dataChannel = event.channel;

                if (dataChannel.label === "chat") {
                    setDataChannel(dataChannel); // existing main channel

                    dataChannel.onopen = () => {
                        setTimeout(() => {
                            try {
                                const nm = name;
                                dataChannel.send(JSON.stringify({ type: "name", name:nm }));
                                setLocalName(nm);
                            } catch (error) {
                                toast.error("Error sending message.");
                            }
                        }, 110);

                        console.log("✅ Chat channel open")
                    };
                    dataChannel.onclose = () => console.log("❌ Chat channel closed");
                    dataChannel.onerror = (error) => console.error("❌ Chat channel error:", error);

                } else if (dataChannel.label === "file") {
                    setFileTransferChannel(dataChannel); // set in Zustand

                    dataChannel.binaryType = "arraybuffer";

                    dataChannel.onopen = () => console.log("✅ File channel open");
                    dataChannel.onclose = () => console.log("❌ File channel closed");
                    dataChannel.onerror = (error) => console.error("❌ File channel error:", error);
                }
            };


            // Handle ICE candidates
            peerConnection.onicecandidate = async (event) => {
                if (event.candidate) {
                    // Add candidate to Firestore
                    const candidatesRef = collection(db, "rooms", roomId, "calleeCandidates");
                    await addDoc(candidatesRef, event.candidate.toJSON());
                } else {
                    console.log('✅ All local ICE candidates gathered');
                }
            };

            // Set remote description (offer)
            await peerConnection.setRemoteDescription(new RTCSessionDescription(roomData.offer));
            console.log("✅ Remote description set successfully");

            // Create answer
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            console.log("✅ Local description set successfully");

            // Save answer to Firestore
            await setDoc(roomRef, {
                answer: {
                    type: answer.type,
                    sdp: answer.sdp
                }
            }, { merge: true });


            // Listen for ICE candidates from caller
            const callerCandidatesRef = collection(db, "rooms", roomId, "callerCandidates");
            onSnapshot(callerCandidatesRef, (snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === "added") {
                        const candidate = change.doc.data();
                        // Add candidate if remote description is set, otherwise store for later
                        if (peerConnection.remoteDescription) {
                            try {
                                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                            } catch (error) {
                                console.error("Error adding remote ICE candidate:", error);
                            }
                        } else {
                            addPendingCandidate(candidate);
                        }
                    }
                });
            });

            // Process any pending candidates
            await processPendingCandidates();

            // Navigate to the room
            navigate(`/room/${roomId}`);

        } catch (error) {
            toast.error("Error joining room");
            setError(`Failed to join room: ${error.message}`);
            resetState();
            setJoining(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-lg md:text-2xl">Join Room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-center">
                        You're about to join room: <strong>{roomId}</strong>
                    </p>

                    {/* Media Permission Controls */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Media Permissions</h3>
                        <p className="text-sm text-muted-foreground">
                            Choose which devices you want to enable for this session.
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Camera className="h-5 w-5 text-primary" />
                                <Label htmlFor="camera-toggle">Camera</Label>
                            </div>
                            <Switch
                                id="camera-toggle"
                                checked={enableCamera}
                                onCheckedChange={setEnableCamera}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Mic className="h-5 w-5 text-primary" />
                                <Label htmlFor="microphone-toggle">Microphone</Label>
                            </div>
                            <Switch
                                id="microphone-toggle"
                                checked={enableMicrophone}
                                onCheckedChange={setEnableMicrophone}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col items-center text-center bg-muted p-4 rounded">
                        <div className="flex space-x-4 text-3xl text-gray-500 mb-2">
                            <VideoOff className="w-8 h-8" />
                            <MicOff className="w-8 h-8" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            (Camera and mic are initially off. You can turn them on after joining if you give permissions.)
                        </p>
                    </div>

                    {error && (
                        <div className="text-red-500 text-center py-2 bg-red-50 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col space-y-4">
                        <Button
                            onClick={handleJoinRoom}
                            disabled={joining}
                        >
                            {joining ? "Joining..." : "Join Room"}
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => navigate('/')}
                        >
                            Cancel
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center pt-4">
                        By using Peer Share, you agree to our{" "}
                        <a href="/privacy" className="underline hover:text-primary transition-colors">Privacy Policy</a> and{" "}
                        <a href="/terms" className="underline hover:text-primary transition-colors">Terms & Conditions</a>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}