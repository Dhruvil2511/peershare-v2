"use client";
import React from "react";
import { twMerge } from "tailwind-merge";
import { TracingBeam } from "./ui/tracing-beam";
import p2p from "../assets/peer-to-peer.svg"
import videocall from "../assets/video-call.svg";
import eco_friendly from "../assets/eco-friendly.svg";
import secure from "../assets/secure.svg";
import worldwide from "../assets/world-wide.svg";


export function TracingBeamContent() {
  return (
    <TracingBeam className="px-10 ">
      <div className="max-w-2xl mx-auto antialiased pt-4 relative">
        {dummyContent.map((item, index) => (
          <div key={`content-${index}`} className="w-full md:mx-15 my-10 bg-muted/50 dark:bg-muted/20 rounded-xl p-6 text-lg prose prose-lg dark:prose-invert ">
            <h2 className="bg-black rounded-full text-sm w-fit px-4 py-1 mb-4 dark:bg-white text-background">
              {item.badge}
            </h2>

            <p className={twMerge("text-3xl mb-4")}>
              {item.title}
            </p>

            <div className="flex justify-center mb-8">
              {item.source && (
                <img
                  src={item.source}
                  alt={item.badge}
                  className="w-60 h-60 object-contain"
                />
              )}
            </div>

            <div className="text-lg prose prose-lg dark:prose-invert mx-auto px-4">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </TracingBeam>
  );
}

const dummyContent = [
  {
    title: "What is PeerShare?",
    description: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Peer Share uses WebRTC Technology to find the shortest path and make direct connections.</li>
        <li>It supports real-time file transfer, live chat, and video communication.</li>
        <li>We don't store anything! Data is shared without intermediate servers.</li>
      </ul>
    ),
    badge: "PeerShare",
    source: p2p,
  },
  {
    title: "Live Chat & Video Call",
    description: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Experience seamless live communication.</li>
        <li>Combines file-transfer, chat, and video into one powerful platform.</li>
        <li>PeerShare works across devices and platforms.</li>
      </ul>
    ),
    badge: "Live Chat & Video",
    source: videocall,
  },
  {
    title: "Low Environmental Impact",
    description: (
      <ul className="list-disc pl-5 space-y-2">
        <li>No need for massive servers – Peer Share is serverless.</li>
        <li>This reduces energy consumption and carbon footprint.</li>
        <li>Decentralized sharing = greener tech.</li>
      </ul>
    ),
    badge: "Eco-Friendly",
    source: eco_friendly,
  },
  {
    title: "Your Files Stay Private",
    description: (
      <ul className="list-disc pl-5 space-y-2">
        <li>WebRTC + DTLS ensures encrypted data transmission.</li>
        <li>End-to-end encryption: only receiver can decrypt.</li>
        <li>No storage = no access after tab is closed.</li>
      </ul>
    ),
    badge: "Privacy",
    source: secure,
  },
  {
    title: "Global Sharing Made Simple",
    description: (
      <ul className="list-disc pl-5 space-y-2">
        <li>Built for the web, works globally.</li>
        <li>Just an internet connection is enough.</li>
        <li>Close the tab and files vanish — secure & temporary.</li>
      </ul>
    ),
    badge: "Global",
    source: worldwide,
  },
];
