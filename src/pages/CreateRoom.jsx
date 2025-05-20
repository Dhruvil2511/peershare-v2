import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { useNavigate } from "react-router-dom";
import useWebRTCStore from "../store/connectionStore";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { toast } from "sonner";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Mic, Camera } from "lucide-react";

export default function CreateRoom() {
    const [roomName, setRoomName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCustomRoomGenerating, setIsCustomRoomGenerating] = useState(false);
    const [enableCamera, setEnableCamera] = useState(true);
    const [enableMicrophone, setEnableMicrophone] = useState(true);
    const navigate = useNavigate();

    const createRoom = useWebRTCStore((state) => state.createRoom);
    const connectionStatus = useWebRTCStore((state) => state.connectionStatus);

    const handleGenerateInstantRoom = async () => {
        setIsGenerating(true);
        try {
            // Pass the media preferences to createRoom
            const generatedRoomId = await createRoom(undefined, false, { enableCamera, enableMicrophone });
            if (generatedRoomId) {
                navigate(`/waiting-room/${generatedRoomId}`);
            } else {
                toast.error("Failed to generate a room, please try again.");
            }
        } catch (error) {
            toast.error("An error occurred while generating the room.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCustomRoom = async () => {
        if (!roomName.trim()) return;
        setIsCustomRoomGenerating(true);

        try {
            const STALE_THRESHOLD = 30000;
            const roomRef = doc(db, "rooms", roomName.trim());
            const roomSnapshot = await getDoc(roomRef);

            if (roomSnapshot.exists()) {
                const roomData = roomSnapshot.data();
                const lastSeen = roomData.lastSeen || 0;
                const isStale = Date.now() - lastSeen > STALE_THRESHOLD;

                if (roomData?.connectionStatus === "disconnected" || isStale) {
                    toast.info("Room is stale. Reclaiming room");
                    // Pass the media preferences to createRoom
                    await createRoom(roomName.trim(), true, { enableCamera, enableMicrophone });
                    navigate(`/waiting-room/${roomName.trim()}`);
                } else {
                    toast.error("Room is active. Try a different name.");
                }
            } else {
                // Pass the media preferences to createRoom
                await createRoom(roomName.trim(), false, { enableCamera, enableMicrophone });
                navigate(`/waiting-room/${roomName.trim()}`);
            }
        } catch (error) {
            toast.error("Error creating room. Please try again.");
        } finally {
            setIsCustomRoomGenerating(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen p-4 bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Create a room</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
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

                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold">Join Instant Room</h3>
                        <p className="text-sm text-muted-foreground">
                            Instantly join a room with a random unique ID generated for you.
                        </p>
                        <div className="mt-4">
                            <Button
                                className="w-full"
                                onClick={handleGenerateInstantRoom}
                                disabled={isGenerating || isCustomRoomGenerating}
                            >
                                {isGenerating ? "Generating..." : "Generate Instant Link"}
                            </Button>
                            {connectionStatus !== 'Initializing...' && (
                                <p className="text-sm mt-2 text-center">{connectionStatus}</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-semibold">Create Custom Room</h3>
                        <p className="text-sm text-muted-foreground">
                            Enter a name to create a custom room.
                        </p>
                        <div className="mt-4 flex flex-col gap-2">
                            <Input
                                type="text"
                                placeholder="Enter Room Name"
                                value={roomName}
                                onChange={(e) => setRoomName(e.target.value)}
                            />
                            <Button
                                onClick={handleCustomRoom}
                                disabled={!roomName.trim() || isCustomRoomGenerating || isGenerating}
                            >
                                {isCustomRoomGenerating ? "Creating..." : "Create Room"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}