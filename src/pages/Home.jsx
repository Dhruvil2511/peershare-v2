import React from 'react';
import { Hero } from '@/components/Hero';
import { TracingBeamContent } from '@/components/Tracing-content';

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
