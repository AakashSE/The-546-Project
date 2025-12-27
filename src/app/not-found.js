"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Using relative path to match your structure
import useMarsSound from "../hooks/useMarsSound";

export default function NotFound() {
    const router = useRouter();
    const [logs, setLogs] = useState([
        "ERROR 404: COORDINATES INVALID",
        "INITIATING RECOVERY PROTOCOL...",
    ]);

    // Audio - utilizing the hook safely
    const { playSound: playStatic } = useMarsSound("/assets/Jettison.mp3");
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");

    // --- 1. LIVE CONSOLE LOGIC ---
    useEffect(() => {
        setLogs([
            "SYSTEM_ERROR: ROUTE_NOT_FOUND",
            "TRACING_VECTOR: FAILED",
            "RE-ROUTING TO HOME...",
            "INITIATING_RECOVERY_PROTOCOL"
        ]);

        // Auto-redirect after 5 seconds
        const timer = setTimeout(() => {
            router.push('/');
        }, 5000);

        // Play a glitch sound on mount
        playStatic();

    }, [router, playStatic]);

    return (
        <div className="fixed inset-0 bg-black text-[#C1440E] font-courier z-[9999] overflow-hidden flex flex-col items-center justify-center select-none">

            {/* --- A. CRT SCREEN EFFECTS --- */}
            {/* Static Noise Background */}
            <div className="absolute inset-0 opacity-[0.15] pointer-events-none z-0"
                style={{ backgroundImage: 'url("/assets/noise.png")' }} />

            {/* Scanlines */}
            <div className="absolute inset-0 z-10 pointer-events-none"
                style={{ background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))", backgroundSize: "100% 2px, 3px 100%" }} />

            {/* Vignette */}
            <div className="absolute inset-0 z-20 pointer-events-none bg-[radial-gradient(circle,transparent_50%,black_100%)]" />


            {/* --- B. MAIN CONTENT --- */}
            <div className="relative z-30 text-center flex flex-col items-center gap-8 px-4">

                {/* The Glitching 404 */}
                <div className="relative">
                    <h1 className="text-[12rem] md:text-[20rem] font-black leading-none tracking-tighter text-white opacity-10 blur-sm absolute top-0 left-0 w-full select-none animate-pulse">
                        404
                    </h1>
                    <h1 className="text-[12rem] md:text-[20rem] font-black leading-none tracking-tighter text-[#C1440E] mix-blend-difference relative animate-glitch-text">
                        404
                    </h1>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-[0.5em] bg-black text-white px-4 py-1 inline-block">
                        SIGNAL LOST
                    </h2>
                    <p className="text-xs md:text-sm uppercase tracking-widest text-[#C1440E]/60">
                        The page you are looking for has been jettisoned.
                    </p>
                </div>

                {/* Action Button */}
                <Link
                    href="/"
                    onClick={() => playClick()}
                    className="mt-8 px-12 py-4 border border-[#C1440E] text-[#C1440E] hover:bg-[#C1440E] hover:text-black transition-all duration-300 font-bold uppercase tracking-[0.2em] relative group overflow-hidden"
                >
                    <span className="relative z-10">Establish Re-Link</span>
                    {/* Scan sweep effect on hover */}
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out z-0" />
                </Link>

            </div>


            {/* --- C. THE CONSOLE LOG (Bottom Left) --- */}
            <div className="absolute bottom-8 left-8 z-30 hidden md:block">
                <div className="w-80 h-48 border-l-2 border-b-2 border-[#C1440E]/30 p-4 font-mono text-[10px] text-[#C1440E]/80 flex flex-col justify-end bg-black/80 backdrop-blur-md">
                    {logs.map((log, index) => (
                        <div key={index} className="animate-typewriter overflow-hidden whitespace-nowrap">
                            <span className="opacity-50 mr-2">[SYS_LOG]</span>
                            {log}
                        </div>
                    ))}
                    <div className="animate-pulse mt-1">_</div>
                </div>
            </div>

            {/* --- D. DECORATIVE CORNERS --- */}
            <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-[#C1440E]/50 z-30" />
            <div className="absolute top-8 right-8 w-16 h-16 border-t-2 border-r-2 border-[#C1440E]/50 z-30" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-[#C1440E]/50 z-30" />


            {/* --- CSS ANIMATIONS --- */}
            <style jsx>{`
        @keyframes glitch-text {
          0% { transform: translate(0); text-shadow: 2px 2px 0px red; }
          20% { transform: translate(-2px, 2px); text-shadow: -2px -2px 0px blue; }
          40% { transform: translate(2px, -2px); text-shadow: 2px -2px 0px green; clip-path: inset(20% 0 50% 0); }
          60% { transform: translate(-2px, 2px); clip-path: inset(50% 0 10% 0); }
          80% { transform: translate(2px, -2px); text-shadow: -2px 2px 0px red; }
          100% { transform: translate(0); text-shadow: 2px 2px 0px blue; }
        }
        .animate-glitch-text {
          animation: glitch-text 0.4s infinite linear alternate-reverse;
        }
      `}</style>
        </div>
    );
}