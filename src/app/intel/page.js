"use client";
import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import useMarsSound from "../../hooks/useMarsSound";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, Stars } from "@react-three/drei";
import HolographicMars from "../../components/HolographicMars";

// --- 1. DECRYPTION TITLE COMPONENT ---
const DecryptTitle = ({ text }) => {
    const [displayText, setDisplayText] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    useEffect(() => {
        let iteration = 0;
        let interval = setInterval(() => {
            setDisplayText((prev) =>
                text.split("").map((letter, index) => {
                    if (index < iteration) return text[index];
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join("")
            );
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayText}</span>;
};

// --- 2. REDACTED TEXT COMPONENT ---
const Redacted = ({ children, delay = 0 }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const ref = useRef(null);
    const { playSound: playReveal } = useMarsSound("/assets/ColourClick.mp3");

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsRevealed(true);
                        if (Math.random() > 0.7) playReveal();
                    }, delay);
                }
            },
            { threshold: 1.0 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [delay, playReveal]);

    return (
        <span
            ref={ref}
            className="relative inline-block cursor-help group"
            onMouseEnter={() => setIsRevealed(true)}
        >
            <span className={`transition-opacity duration-700 ${isRevealed ? "opacity-100" : "opacity-0"}`}>
                {children}
            </span>
            {/* The Censor Bar */}
            <span
                className={`absolute inset-0 bg-[#C1440E] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isRevealed ? "w-0 opacity-0" : "w-full opacity-100 animate-pulse"}
        `}
            />
        </span>
    );
};

export default function IntelPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white font-courier cursor-none overflow-x-hidden relative flex flex-col">

            <Header theme="dark" />


            {/* BACKGROUND: 3D HOLOGRAPHIC MARS */}
            <div className="fixed inset-0 z-0 pointer-events-none">

                <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
                    {/* Cinematic Lighting */}
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#ff8e5e" />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} color="#0044ff" /> {/* Cool rim light */}

                    <Stars radius={150} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

                    <HolographicMars />

                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />

                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* FOREGROUND: HUD INTERFACE */}
            <main className="flex-1 relative z-10 flex flex-col justify-start pt-32 md:pt-48 px-4 md:px-12 pointer-events-none min-h-screen">


                {/* TOP HEADER - Floating */}

                <div className="absolute top-48 left-8 md:left-12 pointer-events-auto">
                    <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-2">
                        <DecryptTitle text="INTEL" />
                    </h1>
                    <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#C1440E] animate-pulse">
                        // Planetary Database // Level 5
                    </p>
                </div>


                {/* CENTRAL CONTENT GRID - HUD CARDS */}
                <div className="w-full flex-grow max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 place-content-center items-center pb-32">



                    {/* LEFT PANEL: MISSION */}
                    <div className="md:col-span-1 flex flex-col gap-8 pointer-events-auto">
                        <div className="bg-black/40 backdrop-blur-md border-l-2 border-[#C1440E] p-8 relative overflow-hidden group hover:bg-black/60 transition-colors">
                            {/* Decorative Line to Planet */}
                            <div className="hidden md:block absolute top-1/2 -right-20 w-20 h-[1px] bg-gradient-to-r from-[#C1440E] to-transparent"></div>

                            <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 text-[#C1440E]">
                                01 // The Mission
                            </h2>
                            <div className="text-xs md:text-sm leading-loose text-white/80 font-mono space-y-6">
                                <p>
                                    Mars Supply Co. directive: <br />
                                    <strong className="text-white">
                                        <Redacted delay={200}>Adaptation is mandatory.</Redacted>
                                    </strong>
                                </p>
                                <p>
                                    We design for the <Redacted delay={500}>hostility of the void</Redacted>.
                                    Our textiles are the barrier between fragility and <span className="text-white border-b border-[#C1440E]">Dominance</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CENTER SPACER (For Planet Visibility) */}
                    <div className="hidden md:block md:col-span-1 h-64"></div>

                    {/* RIGHT PANEL: MATERIALS */}
                    <div className="md:col-span-1 flex flex-col gap-8 pointer-events-auto md:text-right">
                        <div className="bg-black/40 backdrop-blur-md border-r-2 border-[#C1440E] p-8 relative overflow-hidden group hover:bg-black/60 transition-colors">
                            {/* Decorative Line to Planet */}
                            <div className="hidden md:block absolute top-1/2 -left-20 w-20 h-[1px] bg-gradient-to-l from-[#C1440E] to-transparent"></div>

                            <h2 className="text-2xl font-bold uppercase tracking-widest mb-4 text-[#C1440E]">
                                02 // Materials
                            </h2>
                            <ul className="space-y-4 font-mono text-xs uppercase tracking-widest text-white/50 inline-block text-left w-full">
                                <li className="flex justify-between border-b border-white/10 pb-2 group/item hover:border-[#C1440E] transition-colors">
                                    <span className="group-hover/item:text-[#C1440E] transition-colors">Graphene Mesh</span>
                                    <span className="text-white"><Redacted delay={1000}>Thermal Control</Redacted></span>
                                </li>
                                <li className="flex justify-between border-b border-white/10 pb-2 group/item hover:border-[#C1440E] transition-colors">
                                    <span className="group-hover/item:text-[#C1440E] transition-colors">Aerogel Padding</span>
                                    <span className="text-white"><Redacted delay={1200}>Weightless</Redacted></span>
                                </li>
                                <li className="flex justify-between border-b border-white/10 pb-2 group/item hover:border-[#C1440E] transition-colors">
                                    <span className="group-hover/item:text-[#C1440E] transition-colors">Basalt Fiber</span>
                                    <span className="text-white"><Redacted delay={1400}>Rad-Shield</Redacted></span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>

                {/* BOTTOM FOOTER - DECORATIVE */}
                <div className="absolute bottom-8 right-8 md:right-12 text-right opacity-40">
                    <p className="text-[10px] uppercase tracking-widest text-white">
                        Holo-Viz: Active
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-[#C1440E] animate-pulse">
                        Transmission Secure
                    </p>
                </div>

            </main>
            <Footer />
        </div>

    );
}