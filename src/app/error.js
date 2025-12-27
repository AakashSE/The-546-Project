"use client"; // Error components must be Client Components

import React, { useEffect, useState } from "react";
import Link from "next/link";
import useMarsSound from "../hooks/useMarsSound";

export default function Error({ error, reset }) {
    const [logs, setLogs] = useState([
        "SYSTEM_FAILURE: CRITICAL ERROR DETECTED",
        "ANALYZING CORE DUMP...",
    ]);

    // Audio
    const { playSound: playStatic } = useMarsSound("/assets/Jettison.mp3");
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
        playStatic();

        setTimeout(() => {
            setLogs(prev => [...prev, "ERROR_CODE: " + (error.digest || "UNKNOWN")]);
        }, 1000);

        setTimeout(() => {
            setLogs(prev => [...prev, "ATTEMPTING AUTO-RECOVERY..."]);
        }, 2000);
    }, [error, playStatic]);

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

                {/* The Glitching Error Title */}
                <div className="relative">
                    <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-white opacity-10 blur-sm absolute top-0 left-0 w-full select-none animate-pulse">
                        ERROR
                    </h1>
                    <h1 className="text-[8rem] md:text-[12rem] font-black leading-none tracking-tighter text-[#C1440E] mix-blend-difference relative animate-glitch-text">
                        ERROR
                    </h1>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl md:text-2xl font-bold uppercase tracking-[0.5em] bg-black text-white px-4 py-1 inline-block">
                        SYSTEM MALFUNCTION
                    </h2>
                    <p className="text-xs md:text-sm uppercase tracking-widest text-[#C1440E]/60 max-w-md mx-auto">
                        An unexpected anomaly has occurred in the mainframe.
                        <br />
                        <span className="text-white/40 text-[10px] mt-2 block">{error.message}</span>
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-8">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => { playClick(); reset(); }
                        }
                        className="px-8 py-4 border border-[#C1440E] bg-[#C1440E]/10 text-[#C1440E] hover:bg-[#C1440E] hover:text-black transition-all duration-300 font-bold uppercase tracking-[0.2em]"
                    >
                        Retry Sequence
                    </button>
                    <Link
                        href="/"
                        onClick={() => playClick()}
                        className="px-8 py-4 border border-white/20 text-white/50 hover:bg-white hover:text-black transition-all duration-300 font-bold uppercase tracking-[0.2em]"
                    >
                        Return to Base
                    </Link>
                </div>

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
