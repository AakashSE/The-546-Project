"use client";
import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { shaderMaterial, Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import Image from "next/image";
import { useAudio } from '../context/AudioContext';

// --- 1. ATMOSPHERE SHADER ---
const AtmosphereMaterial = shaderMaterial(
  {
    uColor: new THREE.Color("#C1440E"), // Mars Red/Orange
    uSunPosition: new THREE.Vector3(0, 0, -1),
    uIntensity: 0.0,
  },
  // Vertex
  `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vViewDirection;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
      vViewDirection = normalize(-vPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment
  `
    varying vec3 vNormal;
    varying vec3 vViewDirection;
    uniform vec3 uColor;
    uniform float uIntensity;

    void main() {
      float viewDot = dot(vViewDirection, vNormal);
      float rim = 1.0 - max(viewDot, 0.0);
      rim = pow(rim, 6.0);
      vec3 finalColor = uColor * rim * uIntensity; 
      float alpha = rim * uIntensity;
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
);
extend({ AtmosphereMaterial });

function EclipseScene({ progress }) {
  const materialRef = useRef();
  const sunRef = useRef();
  const groupRef = useRef();

  useFrame((state, delta) => {
    // 1. ROTATE PLANET
    if (groupRef.current) {
      groupRef.current.rotation.z += delta * 0.01;
    }

    // 2. ATMOSPHERE INTENSITY
    if (materialRef.current) {
      const targetIntensity = 2.0 + (progress / 100) * 10.0;
      materialRef.current.uIntensity = THREE.MathUtils.lerp(
        materialRef.current.uIntensity,
        targetIntensity,
        delta * 0.5
      );

      // Color shift: Red -> White
      if (progress > 90) {
        materialRef.current.uColor.lerp(new THREE.Color("#ffffff"), delta * 0.2);
      }
    }

    // 3. SUN MOVEMENT
    if (sunRef.current) {
      const targetY = -2.2 + (progress / 100) * 3.6;
      sunRef.current.position.y = THREE.MathUtils.lerp(sunRef.current.position.y, targetY, delta * 0.5);
    }
  });

  return (
    <group ref={groupRef}>
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
      <mesh>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        {/* @ts-ignore */}
        <atmosphereMaterial
          ref={materialRef}
          transparent
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh ref={sunRef} position={[-0.5, -2.2, -6]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={[10, 4, 1]}
          emissive={[10, 4, 1]}
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default function Preloader({ onComplete, onExitStart }) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false); // New State
  const containerRef = useRef();
  const uiRef = useRef();
  const { setAmbienceAllowed, preloadSounds } = useAudio(); // Control global audio & preload

  // WEB AUDIO REFS
  const audioCtxRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);

  // 1. Simulation Logic (Wait for interaction)
  const [statusText, setStatusText] = useState("INITIALIZING UPLINK...");

  useEffect(() => {
    if (!hasInteracted) return; // Wait for click

    // --- START PRELOADER AUDIO (Web Audio API) ---
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // PRELOAD CRITICAL ASSETS (Zero Latency)
        if (preloadSounds) {
          preloadSounds([
            "/assets/AcquireAsset.mp3",
            "/assets/BackToCollection.mp3",
            "/assets/Click.mp3",
            "/assets/Close.mp3",
            "/assets/ColourClick.mp3",
            "/assets/Constellation.mp3",
            "/assets/Docking.mp3",
            "/assets/Error.mp3",
            "/assets/FooterOptions.mp3",
            "/assets/FromHomePageToSpecificProduct.mp3",
            "/assets/HomePageLogo.mp3",
            "/assets/Ignition.mp3",
            "/assets/Jettison.mp3",
            "/assets/Logo_Sound.mp3",
            "/assets/Mars_Audio.mp3",
            "/assets/Success.mp3",
            "/assets/Switch.mp3",
            "/assets/TargetSound.mp3",
            "/assets/Typing.mp3"
          ]);
        }

        const response = await fetch("/assets/Preloader_Audio.mp3");
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true; // Loop while loading

        const gain = ctx.createGain();
        gain.gain.value = 0.5;

        source.connect(gain);
        gain.connect(ctx.destination);

        source.start(0);
        sourceRef.current = source;
        gainRef.current = gain;
      } catch (e) {
        console.error("Preloader Audio Failed:", e);
      }
    };
    initAudio();
    // ---------------------------------------------

    // NON-LINEAR SIMULATION
    let currentProgress = 0;
    let timeoutId;

    const simulateLoading = () => {
      if (currentProgress >= 100) {
        setProgress(100);
        return;
      }

      let increment = 0;
      let delay = 0;
      const r = Math.random();

      // Phases of loading
      if (currentProgress < 20) {
        // Phase 1: Rapid initialization
        increment = Math.random() * 5 + 2;
        delay = Math.random() * 100 + 50;
        setStatusText("INITIALIZING UPLINK...");
      } else if (currentProgress < 50) {
        // Phase 2: Loading core assets (slower, occasional variable jumps)
        increment = Math.random() * 3;
        delay = Math.random() * 300 + 100;
        setStatusText("SYNCHRONIZING ORBITAL DATA...");
      } else if (currentProgress < 80) {
        // Phase 3: Stalls and jumps (simulating network/texture processing)
        if (r > 0.7) {
          // Stall
          increment = 0;
          delay = 400;
        } else {
          increment = Math.random() * 8 + 1;
          delay = 150;
        }
        setStatusText("CALIBRATING ATMOSPHERE...");
      } else {
        // Phase 4: Finalization (fast finish)
        increment = Math.random() * 5 + 5;
        delay = 80;
        setStatusText("FINALIZING SEQUENCE...");
      }

      currentProgress = Math.min(currentProgress + increment, 100);
      setProgress(currentProgress);

      if (currentProgress < 100) {
        timeoutId = setTimeout(simulateLoading, delay);
      }
    };

    simulateLoading();

    return () => {
      clearTimeout(timeoutId);
      // Stop audio handled in completion effect
    };
  }, [hasInteracted]);

  // 2. Completion
  useEffect(() => {
    if (progress >= 100 && !isFinished) {
      setIsFinished(true);

      const tl = gsap.timeline();

      // Step 1: Fade out UI QUICKLY
      tl.to(uiRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" })

        // Step 2: Hold for bloom
        .to({}, { duration: 0.2 })

        // Step 3: Fade out container
        .to(containerRef.current, {
          opacity: 0,
          duration: 1.5,
          ease: "power2.inOut",
          onStart: () => {
            if (onExitStart) onExitStart();

            // Fade out audio over 1.5s
            if (gainRef.current && audioCtxRef.current) {
              gainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 1.5);
            }
          },
          onComplete: () => {
            // STOP PRELOADER AUDIO
            if (sourceRef.current) {
              try { sourceRef.current.stop(); } catch (e) { }
              sourceRef.current = null;
            }
            if (audioCtxRef.current) {
              audioCtxRef.current.close();
            }

            // ALLOW MAIN AUDIO
            setAmbienceAllowed(true);

            if (onComplete) onComplete();
            gsap.set(containerRef.current, { display: 'none' });
          }
        });
    }
  }, [progress, isFinished, onComplete, setAmbienceAllowed]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] bg-black text-white font-courier overflow-hidden">

      {/* 3D SCENE */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 8], fov: 45 }}
          gl={{
            antialias: false,
            stencil: false,
            alpha: false,
            powerPreference: "high-performance",
            toneMapping: THREE.ReinhardToneMapping,
            toneMappingExposure: 1.5
          }}
        >
          <color attach="background" args={['#000']} />
          <EclipseScene progress={progress} />
          <EffectComposer disableNormalPass multisampling={0}>
            <Bloom luminanceThreshold={1.0} luminanceSmoothing={0.2} intensity={1.5} radius={0.8} mipmapBlur />
          </EffectComposer>
        </Canvas>
      </div>

      {/* UI OVERLAY */}
      <div ref={uiRef} className="absolute inset-0 z-10 p-6 md:p-12 flex flex-col justify-between">

        {/* START BUTTON (Center) */}
        {!hasInteracted ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-50 bg-black/80 backdrop-blur-md">
            <button
              onClick={() => setHasInteracted(true)}
              className="group relative flex flex-col items-center justify-center w-32 h-32 outline-none"
              aria-label="Initialize Uplink"
            >
              {/* RING 1: Radar Sweep (Subtle) */}
              <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-0 border-t border-transparent border-l border-white/20 rounded-full animate-[spin_4s_linear_infinite]" />

              {/* CORE: Rocket Icon */}
              <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-500">
                {/* Zero-G Float Animation */}
                <div className="animate-[bounce_3s_infinite_ease-in-out]">

                  {/* ENGINE FLAME (Visible on Hover) */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-4 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-full h-full bg-orange-500/50 blur-sm rounded-full animate-pulse" />
                    <div className="absolute inset-0 bg-red-500/80 blur-md rounded-full animate-[ping_0.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  </div>

                  {/* Main Rocket SVG */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="relative z-10 w-full h-full text-white/80 group-hover:text-[#C1440E] transition-colors duration-300"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                  </svg>

                  {/* ADVANCED TRACE: Chromatic Aberration (Cyan Shift) */}
                  <div className="absolute inset-0 text-cyan-400 opacity-0 group-hover:opacity-40 mix-blend-screen -translate-x-[2px] translate-y-[1px] animate-[pulse_0.1s_infinite]">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                  </div>

                  {/* ADVANCED TRACE: Chromatic Aberration (Red Shift) */}
                  <div className="absolute inset-0 text-red-600 opacity-0 group-hover:opacity-40 mix-blend-screen translate-x-[2px] -translate-y-[1px] animate-[pulse_0.15s_infinite]">
                    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                  </div>

                </div>
              </div>

              {/* TEXT */}
              <div className="absolute top-[130%] flex flex-col items-center gap-2 whitespace-nowrap">
                <span className="font-mono text-[10px] tracking-[0.3em] text-white/60 group-hover:text-[#C1440E] transition-colors duration-300">
                  INITIALIZE SYSTEM
                </span>

                {/* Fullscreen Instruction */}
                <span className="font-google-sans text-[8px] tracking-[0.2em] text-white/40 uppercase opacity-70 group-hover:opacity-100 transition-opacity delay-100">
                  ( Enable Fullscreen )
                </span>

                <div className="w-0 group-hover:w-full h-[1px] bg-[#C1440E] transition-all duration-300 mt-1" />
              </div>
            </button>
          </div>
        ) : (
          // LOADING BAR (Bottom Right) - Only show after interaction
          <div className="absolute bottom-6 right-6 md:bottom-12 md:right-12 flex flex-col items-end gap-2 text-right">

            {/* Brand Logo SVG */}
            <div className="relative w-32 h-8 md:w-48 md:h-12 mb-2 opacity-80">
              <Image
                src="/assets/PreLoader.svg"
                alt="Brand Identity"
                fill
                className="object-contain object-right"
              />
            </div>

            {/* Status Text & Percentage */}
            <div className="flex items-center justify-between w-[200px] md:w-[300px]">
              <span className="font-mono text-[9px] text-white/50 tracking-widest uppercase">
                {statusText}
              </span>
              <span className="font-mono text-[10px] text-[#C1440E] tracking-widest">
                {Math.floor(progress)}%
              </span>
            </div>

            {/* Loading Bar Container */}
            <div className="w-[200px] md:w-[300px] h-[2px] bg-white/10 relative overflow-hidden group">
              {/* Main Fill */}
              <div
                className="h-full bg-[#C1440E] shadow-[0_0_15px_#C1440E] relative transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              >
                {/* Leading Edge Flash */}
                <div className="absolute top-1/2 -right-[1px] -translate-y-1/2 w-[20px] h-[10px] bg-white rounded-full blur-[4px] opacity-80" />
              </div>
            </div>

            {/* Decorative Sub-text */}
            <div className="font-google-sans text-[8px] tracking-[0.2em] text-white/20 uppercase">
              System Integrity Check
            </div>

          </div>
        )}

      </div>

      <style jsx>{`
        .font-syncopate {
            font-family: 'Syncopate', sans-serif;
        }
      `}</style>
    </div>
  );
}