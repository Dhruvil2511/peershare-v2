import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import visual from "../assets/visual.webp"

export default function AboutPage() {
    return (
        <ScrollArea className="h-full w-full p-6 my-24">
            {/* Visual Illustration */}
            <div className="flex flex-col items-center mb-8">
                <img
                    src={visual}
                    alt="Peer-to-Peer Communication"
                    className="w-full max-w-3xl rounded-2xl shadow-md"
                />
                <p className="text-sm text-muted-foreground mt-2">
                    A simple visual of peer-to-peer (P2P) connections – direct, private, and decentralized.
                </p>
            </div>

            <Card className="max-w-4xl mx-auto">
                <CardContent className="p-6 space-y-6 text-base leading-relaxed text-muted-foreground">

                    {/* Why I Created PeerShare */}
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-2">🎯 Why we Created PeerShare</h2>
                        <p>
                            During college lab hours, most social sites were blocked — but the network was still active. One day, I wanted to chat
                            with a friend from another class, and we stumbled upon a clever workaround: <a href="https://codeshare.io" className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">Codeshare.io</a>.
                            It let us share code live, so we just started messaging each other there.
                        </p>
                        <p className="mt-3">
                            That sparked our curiosity: what kind of tech allows this real-time interaction? We discovered <strong>WebRTC</strong>,
                            and that became the seed for PeerShare. What began as a hacky chat tool turned into a full-fledged peer-to-peer app
                            with secure <strong>1-on-1 chat</strong>, <strong>video calls</strong>, <strong>screen sharing</strong>, and <strong>file transfers</strong>.
                        </p>
                        <p className="mt-3">
                            PeerShare was born from a simple need — and built with the drive to learn, experiment, and solve a real-world limitation with tech.
                        </p>
                    </section>


                    <Separator />

                    {/* Privacy & Security */}
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground mb-2">🔐 Privacy & Security</h2>
                        <p>
                            PeerShare uses WebRTC for direct communication between devices. That means:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>Files, videos, and messages are not stored on servers.</li>
                            <li>Connections are encrypted and transient.</li>
                            <li>Once the session ends, your data is gone — forever.</li>
                        </ul>
                    </section>


                </CardContent>
            </Card>
        </ScrollArea>
    );
}
