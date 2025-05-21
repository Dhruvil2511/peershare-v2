"use client";
import React from "react";
import { StickyScroll } from "./ui/sticky-scroll-reveal";
import animation from '../assets/transfer.json';
import earth from '../assets/save_earth.json';
import secure from '../assets/secure.json';
import globe from '../assets/globe.json';
import video from '../assets/video.json';
import LottiePlayer from "./LottiePlayer";

const content = [
  {
    title: "What is PeerShare?",
    description:
      "Peer Share uses WebRTC Technology to find the shortest path and make direct connections. It supports real-time file transfer, live chat, and video communication. We don't store anything! Data is shared without intermediate servers.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <LottiePlayer
          animationData={animation}
          className="w-[250px] md:w-[400px]"
        />
      </div>
    ),
  },
  {
    title: "Live Chat & Video Call",
    description:
      "Experience seamless live communication. Combines file-transfer, chat, and video into one powerful platform. PeerShare works across devices and platforms.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <LottiePlayer
          animationData={video}
          className="w-[250px] md:w-[400px]"
        />
      </div>
    ),
  },
  {
    title: "Low Environmental Impact",
    description:
      "No need for massive servers – Peer Share is serverless. This reduces energy consumption and carbon footprint. Decentralized sharing = greener tech.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <LottiePlayer
          animationData={earth}
          className="w-[250px] md:w-[400px]"
        />
      </div>
    ),
  },
  {
    title: "Your Files Stay Private",
    description:
      "WebRTC + DTLS ensures encrypted data transmission. End-to-end encryption: only receiver can decrypt. No storage = no access after tab is closed.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <LottiePlayer
          animationData={secure}
          className="w-[250px] md:w-[400px]"
        />
      </div>
    ),
  },
  {
    title: "Global Sharing Made Simple",
    description:
      "Built for the web, works globally. Just an internet connection is enough. Close the tab and files vanish — secure & temporary.",
    content: (
      <div className="flex h-full w-full items-center justify-center">
        <LottiePlayer
          animationData={globe}
          className="w-[250px] md:w-[400px]"
        />
      </div>
    ),
  },
];

export function StickyScrollReveal() {
  return (
    <div className="w-full py-4">
      <StickyScroll content={content} />
    </div>
  );
}
