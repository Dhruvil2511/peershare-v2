"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

import visual from "../assets/visual.webp";
import chrome from "../assets/chrome.webp";
import edge from "../assets/microsoft.webp";
import firefox from "../assets/firefox.webp";
import brave from "../assets/brave.webp";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";


export default function FAQPage() {
    return (
        <div className="px-4 py-24 sm:py-32 min-h-screen flex flex-col items-center justify-center bg-background text-foreground max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-10">Frequently Asked Questions</h1>
            <Accordion type="multiple" className="w-full">

                <AccordionItem value="item-1">
                    <AccordionTrigger>Why peer to peer?</AccordionTrigger>
                    <AccordionContent>
                        <p>
                            <strong>Peer to peer communication</strong> means the communication flows directly between two devices rather than via an intermediate server. It is more private and secure because information goes straight between you and the other person, not through a company server.
                            PeerShare achieves this using <a href="https://en.wikipedia.org/wiki/WebRTC" target="_blank" rel="noreferrer" className="text-primary underline">WebRTC</a> technology.
                        </p>
                        <p className="mt-4 font-semibold">Visual Representation:</p>
                        <img src={visual} alt="PeerShare visual" className="mt-2 rounded-lg" />
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                    <AccordionTrigger>Why is it slower than my maximum network speed?</AccordionTrigger>
                    <AccordionContent>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Speed is limited by the slower of the sender's upload or receiver's download bandwidth.</li>
                            <li>Firewalls and NAT devices can add latency and complexity to connections.</li>
                            <li>Greater physical distance between users can result in higher latency.</li>
                            <li>Browser extensions or add-ons might interfere with WebRTC performance.</li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                    <AccordionTrigger>How long is a file stored on the internet or server?</AccordionTrigger>
                    <AccordionContent>
                        <p>
                            <strong>We don’t store anything except file name and file size.</strong>
                            Your file is either sent directly to your peer or destroyed if the transfer is interrupted.
                            No storage = no risk. Just make sure you have a backup if needed.
                        </p>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                    <AccordionTrigger>What browsers do you support?</AccordionTrigger>
                    <AccordionContent>
                        <p className="mb-4 font-semibold">Currently PeerShare works best on:</p>
                        <div className="flex gap-4 items-center">
                            <img src={chrome} alt="Chrome" width={40} height={40} />
                            <img src={edge} alt="Edge" width={40} height={40} />
                            <img src={brave} alt="Brave" width={40} height={40} />
                            <img src={firefox} alt="Firefox" width={40} height={40} />
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                    <AccordionTrigger>Can I use the app on mobile devices or just on desktop?</AccordionTrigger>
                    <AccordionContent>
                        <p>
                            <strong>Yes</strong>, PeerShare works on most mobile devices and tablets.
                            However, the <strong>best experience</strong> is on desktop or laptop.
                        </p>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                    <AccordionTrigger>Is PeerShare secure?</AccordionTrigger>
                    <AccordionContent>
                        <p>
                            <strong>Yes</strong>. PeerShare uses WebRTC with DTLS and SRTP for encryption, ensuring your data is secure during transfer.
                            Files are transferred directly, never stored, and disappear once the session ends.
                        </p>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                    <AccordionTrigger>Do I need to install anything to use PeerShare?</AccordionTrigger>
                    <AccordionContent>
                        <p>
                            <strong>No installation required.</strong> PeerShare runs completely in your browser. Just open the website and start sharing securely.
                        </p>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>

            <div className="mt-10 text-center">
                <p className="text-xl">Couldn't find your question?</p>
                <div className="text-lg mt-2 flex items-center justify-center gap-4">
                    <span>Contact us:</span>
                    <a
                        href="mailto:peershare.contact@gmail.com"
                        className="text-primary hover:underline hover:text-blue-500"
                    >
                        Mail
                    </a>
                    <Separator orientation="vertical" className="py-2 bg-white " />
                    <Link
                        to="/contact"
                        className="text-primary hover:underline hover:text-blue-500"
                    >
                        Contact
                    </Link>
                </div>

            </div>
        </div>
    );
}