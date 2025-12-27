"use client";
import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import { useAudio } from '../context/AudioContext';
// import OrbitalDiveScene from '../components/OrbitalDive/Scene';
// import SanctuaryScene from '../components/Sanctuary/SanctuaryScene';
import dynamic from 'next/dynamic';
const ParticleScene = dynamic(() => import('../components/Forge/ParticleScene'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black" />
});
import Preloader from '../components/Preloader';
import { motion } from 'framer-motion';
import gsap from 'gsap';

import Footer from '../components/Footer';

export default function Home() {
  const [preloaderGone, setPreloaderGone] = useState(false);
  const [showHome, setShowHome] = useState(false);
  const { setAmbienceAllowed } = useAudio();

  // Initial Check for Hydration match
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('mars_visited')) {
      setPreloaderGone(true);
      setShowHome(true);
      setAmbienceAllowed(true); // Allow audio immediately
    }
  }, []);

  useEffect(() => {
    if (showHome && typeof window !== 'undefined') {
      sessionStorage.setItem('mars_visited', 'true');
    }
  }, [showHome]);

  return (
    <main className="w-full min-h-screen relative bg-black">
      {/* 
        SEAMLESS TRANSITION:
        We render the Home content as soon as showHome is true.
        It starts with opacity 0 and fades in over the preloader.
      */}
      {showHome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="w-full h-full"
        >
          <ParticleScene />
          <Footer />
        </motion.div>
      )}

      {!preloaderGone && (
        <Preloader
          onExitStart={() => setShowHome(true)}
          onComplete={() => setPreloaderGone(true)}
        />
      )}
    </main>
  );
}