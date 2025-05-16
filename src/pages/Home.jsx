import React from 'react';
import animation from '../assets/transfer.json';
import earth from '../assets/save_earth.json';
import secure from '../assets/secure.json';
import globe from '../assets/globe.json';
import video from '../assets/video.json';
import { Hero } from '@/components/Hero';
import { TracingBeamContent } from '@/components/Tracing-content';

const features = [
  { icon: '🤝', label: 'Peer To Peer' },
  { icon: '📦', label: 'No Size Limit' },
  { icon: '💬', label: 'Live Chat' },
  { icon: '🎥', label: 'Video Chat' },
  { icon: '⚡', label: 'Rapid Transfer' },
  { icon: '🌍', label: 'World Wide' }
];

const sections = [
  {
    title: 'What is PeerShare?',
    content: [
      'Peer Share uses WebRTC Technology to find the shortest path and make direct connections.',
      'It supports real-time file transfer, live chat, and video communication.',
      "We don't store anything! Data is shared without intermediate servers.",
    ],
    animation: animation,
    animationSize: '50%',
    reverse: false,
  },
  {
    title: 'Live Chat & Video Call',
    content: [
      'Experience seamless live communication.',
      'Combines file-transfer, chat, and video into one powerful platform.',
      'PeerShare works across devices and platforms.',
    ],
    animation: video,
    animationSize: '30%',
    reverse: true,
  },
  {
    title: 'Low Environmental Impact',
    content: [
      'No need for massive servers – Peer Share is serverless.',
      'This reduces energy consumption and carbon footprint.',
      'Decentralized sharing = greener tech.',
    ],
    animation: earth,
    animationSize: '50%',
    reverse: false,
  },
  {
    title: 'Your Files Stay Private',
    content: [
      'WebRTC + DTLS ensures encrypted data transmission.',
      'End-to-end encryption: only receiver can decrypt.',
      'No storage = no access after tab is closed.',
    ],
    animation: secure,
    animationSize: '50%',
    reverse: true,
  },
  {
    title: 'Global Sharing Made Simple',
    content: [
      'Built for the web, works globally.',
      'Just an internet connection is enough.',
      'Close the tab and files vanish — secure & temporary.',
    ],
    animation: globe,
    animationSize: '30%',
    reverse: false,
  },
];

const Home = () => {
  return (
    <>
      <Hero />
      <h2 className="text-3xl md:text-5xl font-bold text-center my-20">Why PeerShare?</h2>
      <TracingBeamContent />
    </>
  );
};

export default Home;
