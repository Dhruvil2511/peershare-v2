import { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/button";
import useWebRTCStore from "@/store/connectionStore";

export default function ChatPanel({
    messages,
    inputMessage,
    setInputMessage,
    sendMessage,
    acceptFile,
    rejectFile,
}) {
    const messagesEndRef = useRef(null);
    const incomingFileMeta = useWebRTCStore((s) => s.incomingFileMeta);
    const setIncomingFileMeta = useWebRTCStore((s) => s.setIncomingFileMeta);


    // Timer state
    const [timeLeft, setTimeLeft] = useState(30);

    useEffect(() => {
        if (!incomingFileMeta) {
            setTimeLeft(30);
            return;
        }

        const startTime = Date.now();
        const duration = 30 * 1000; // 30 seconds in ms
        const expiryTime = startTime + duration;

        const tick = () => {
            const now = Date.now();
            const delta = Math.round((expiryTime - now) / 1000);

            if (delta <= 0) {
                setTimeLeft(0);
                setIncomingFileMeta(null);
                clearInterval(timerId);
            } else {
                setTimeLeft(delta);
            }
        };

        tick(); // set immediately
        const timerId = setInterval(tick, 1000);

        return () => clearInterval(timerId);
    }, [incomingFileMeta]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage();
    };

    return (
        <div className="flex flex-col h-full p-4">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto space-y-2 p-2 mb-2 rounded">
                {messages.length === 0 ? (
                    <p className="text-center py-4">No messages yet. Start a conversation!</p>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-2 rounded-lg break-words max-w-[85%] md:max-w-[75%] 
                                ${msg.type === 'file-meta' ? 'bg-[#8183F4] text-white' : ''}
                                ${msg.sender === "local"
                                    ? "bg-primary text-primary-foreground ml-auto"
                                    : "bg-[#15D38B] text-primary-foreground mr-auto"
                                }`}

                        >
                            {msg.type === "file-meta" ? (
                                <>
                                    <p className="text-sm font-semibold">📁 File Shared:</p>
                                    <p className="text-sm">Name: {msg.name}</p>
                                    <p className="text-sm">Size: {Math.round(msg.size / 1024)} KB</p>
                                </>
                            ) : (
                                <p className="text-sm break-words">{msg.text}</p>
                            )}
                            <p className="text-xs text-right mt-1 opacity-70">{msg.timestamp}</p>
                        </div>
                    ))
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Incoming File Prompt */}
            {incomingFileMeta && (
                <div className="p-4 mb-2 border rounded-md bg-muted text-sm">
                    <p><strong>Incoming file:</strong> {incomingFileMeta.name} ({Math.round(incomingFileMeta.size / 1024)} KB)</p>
                    <div className="flex gap-2 mt-2">
                        <Button onClick={acceptFile}>Accept</Button>
                        <Button variant="destructive" onClick={rejectFile}>Reject</Button>
                    </div>
                    <div className="mt-2">
                        {/* Show the remaining time */}
                        <p className="text-xs text-center text-gray-500">
                            Time left to accept: {timeLeft}s
                        </p>
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 rounded-md p-2 border border-input bg-background"
                    placeholder="Type a message..."
                    aria-label="Chat message input"
                />
                <Button type="submit" disabled={!inputMessage.trim()}>
                    Send
                </Button>
            </form>
        </div>
    );
}
