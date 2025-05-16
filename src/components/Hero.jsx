"use client";
import { motion } from "framer-motion";
import { HeroHighlight, Highlight } from "./ui/hero-highlight";
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronDown } from "lucide-react";
import Lottie from 'lottie-react';
import heroAnimation from '../assets/hero-animation.json';

const features = [
  { icon: '🤝', label: 'Peer To Peer' },
  { icon: '📦', label: 'No Size Limit' },
  { icon: '💬', label: 'Live Chat' },
  { icon: '🎥', label: 'Video Chat' },
  { icon: '⚡', label: 'File Transfer' },
  { icon: '💻', label: 'Screen Share' }
];

export function Hero() {
  return (
    <HeroHighlight>
      <section className="container mx-auto px-4 pt-24 flex items-center">
        <div className="flex flex-col md:flex-row items-center text-center md:text-left">
          {/* Left Text Section */}
          <div className="md:w-1/2 space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: [20, -5, 0] }}
              transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
              className="text-xl md:text-4xl lg:text-5xl font-bold text-neutral-800 dark:text-white leading-relaxed lg:leading-snug"
            >
              <Highlight >
                Your data, your control.
              </Highlight>

              <br />
              One-One Collaboration Platform
            </motion.h1>

            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300">
              Send files of any size directly from your device — no storage, no servers.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {features.map((f, i) => (
                <div key={i} className="flex items-center space-x-2 justify-center md:justify-start">
                  <span className="text-xl md:text-2xl">{f.icon}</span>
                  <strong className="text-[#8183F4] dark:text-[#8183F4]">{f.label}</strong>
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="pt-6">
              <Button asChild className="bg-[#15D38B] hover:bg-[#13bd7d]">
                <Link to="/create-room">Start Sharing</Link>
              </Button>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="md:w-1/2 md:mt-0 flex justify-center">
            <Lottie animationData={heroAnimation} />
          </div>
        </div>
      </section>

      <div className="mt-20 flex justify-center ">
        <ChevronDown className="w-6 h-6 animate-bounce" />
      </div>
    </HeroHighlight>
  );
}
