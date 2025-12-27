"use client";
import React from 'react';

export default function OrbitalSentinel() {
    const [showLog, setShowLog] = React.useState(false);

    return (
        <div className="relative w-64 h-96 flex flex-col items-center justify-center opacity-90 scale-[0.4] origin-right pointer-events-none">

            {/* BEZEL / UI FRAME REMOVED */}

            {/* MESSAGE POPUP (Counter-Scaled for Readability) - Only visible on click */}
            {showLog && (
                <div className="absolute top-0 right-[200%] w-80 p-6 bg-black/95 border border-[#ff5500]/50 shadow-[0_0_20px_rgba(255,85,0,0.2)] backdrop-blur-md rounded-sm z-50 scale-[2.5] origin-right pointer-events-auto animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="flex justify-between items-center mb-4 border-b border-[#ff5500]/30 pb-2">
                        <span className="font-mono text-[8px] tracking-widest text-[#ff5500] uppercase">
                            // ENCRYPTED_CHANNEL
                        </span>
                        <button
                            onClick={() => setShowLog(false)}
                            className="text-[#ff5500] hover:text-white text-[10px]"
                        >
                            [X]
                        </button>
                    </div>

                    <div className="flex flex-col gap-3 font-mono text-[9px] text-white/80 leading-relaxed">
                        <div className="flex gap-2">
                            <span className="text-[#ff5500] font-bold">[CMD]</span>
                            <span>SENSORS SPIKING. WHAT IN THE... STREAKING LIGHT?</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#ff5500] opacity-80 font-bold">[NAV]</span>
                            <span>UNIDENTIFIED ALIGNMENT DETECTED. SECTOR 7 IS... GEOMETRIC.</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#ff5500] opacity-80 font-bold">[PLT]</span>
                            <span className="italic">LOOK AT THE SCALE OF IT. THEY'RE LIKE JEWELS IN THE VOID.</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-[#ff5500] opacity-80 font-bold">[SCI]</span>
                            <span>IT'S NOT A NEBULA. IT'S AN ARTIFACT. A LIVING CONSTELLATION.</span>
                        </div>
                        <div className="text-[#ff5500]/50 text-[7px] mt-2 animate-pulse pt-2 border-t border-[#ff5500]/20">
                            &gt; SIGNAL_STRENGTH: 98%
                        </div>
                    </div>
                </div>
            )}

            <div className="relative w-full h-full flex items-center justify-center animate-hover-float pointer-events-auto cursor-pointer group" onClick={() => setShowLog(!showLog)}>
                {/* TOOLTIP HINT */}
                {!showLog && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-[#ff5500] text-black text-[8px] font-bold px-2 py-1 rounded-sm tracking-widest scale-[2.0] origin-bottom">
                            CLICK TO INTERCEPT
                        </div>
                        <div className="w-[1px] h-4 bg-[#ff5500] mx-auto scale-[2.0] origin-top" />
                    </div>
                )}

                {/* 1. ADVANCED SCANNER BEAM (Projecting Leftwards) */}
                {/* Wide Cone */}
                <div
                    className="absolute right-[55%] top-[45%] -translate-y-1/2 w-80 h-64 bg-gradient-to-l from-[#ff5500]/10 to-transparent opacity-30 origin-right"
                    style={{ clipPath: 'polygon(100% 45%, 0 0, 0 100%, 100% 55%)' }}
                />
                {/* Data Scan Lines */}
                <div className="absolute right-[55%] top-[45%] -translate-y-1/2 w-80 h-64 opacity-20 overflow-hidden"
                    style={{ clipPath: 'polygon(100% 45%, 0 0, 0 100%, 100% 55%)' }}>
                    <div className="w-full h-[200%] absolute top-0 left-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_4px,#ff5500_5px)] animate-scan-slow" />
                </div>
                {/* Laser Focus */}
                <div className="absolute right-[55%] top-[45%] w-96 h-[1px] bg-[#ff5500]/40 shadow-[0_0_10px_#ff5500] origin-right animate-pulse" />


                {/* 2. DEEP SPACE OBSERVATORY (Hubble/Voyager Hybrid) */}
                <div className="text-[#ff5500] drop-shadow-[0_0_15px_rgba(255,85,0,0.3)] relative z-10 -rotate-[10deg]">
                    {/* Scale: 1 unit = 2px approx */}
                    <svg width="120" height="240" viewBox="0 0 60 120" fill="currentColor">

                        {/* --- SOLAR ARRAYS (The 'Wings') --- */}
                        {/* Top Wing */}
                        <g transform="translate(10, 5)">
                            <rect x="0" y="0" width="40" height="25" fill="#ff5500" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
                            {/* Grid */}
                            <path d="M0,5 H40 M0,10 H40 M0,15 H40 M0,20 H40" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
                            <path d="M10,0 V25 M20,0 V25 M30,0 V25" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
                            <circle cx="20" cy="12.5" r="1" fill="currentColor" />
                        </g>
                        {/* Connecting Truss Top */}
                        <rect x="28" y="30" width="4" height="10" fill="currentColor" opacity="0.8" />


                        {/* --- MAIN BUS (Body) --- */}
                        {/* Telescope Barrel */}
                        <path d="M20,40 H40 V90 H20 V40 Z" fill="#000" stroke="currentColor" strokeWidth="1" />

                        {/* COCKPIT WINDOW (People Inside) */}
                        <rect x="26" y="55" width="8" height="12" fill="#44ffff" fillOpacity="0.8" className="animate-pulse" />
                        <rect x="27" y="56" width="6" height="10" fill="#fff" fillOpacity="0.4" />

                        <rect x="22" y="42" width="16" height="4" opacity="0.5" /> {/* Vent */}
                        <rect x="22" y="48" width="16" height="2" opacity="0.3" /> {/* Ring */}
                        <rect x="22" y="80" width="16" height="8" opacity="0.5" /> {/* Base Engine */}

                        {/* Aperture Door (Open) */}
                        <path d="M20,40 L10,30" stroke="currentColor" strokeWidth="1" />

                        {/* Side Instruments */}
                        <rect x="40" y="50" width="8" height="6" stroke="currentColor" strokeWidth="0.5" fill="none" />
                        <path d="M48,53 L55,53" stroke="currentColor" strokeWidth="0.5" />
                        <circle cx="56" cy="53" r="1.5" /> {/* Sensor */}

                        <rect x="12" y="60" width="8" height="12" stroke="currentColor" strokeWidth="0.5" fill="none" />
                        <path d="M12,66 L5,66" stroke="currentColor" strokeWidth="0.5" />
                        <rect x="2" y="64" width="3" height="4" fill="currentColor" /> {/* RTG */}


                        {/* --- HIGH GAIN ANTENNA (Dish) --- */}
                        {/* Pointing towards 'Earth' (Right/Down) */}
                        <path d="M30,90 L30,95" stroke="currentColor" strokeWidth="2" />
                        <path d="M20,95 Q30,110 40,95" stroke="currentColor" strokeWidth="1" fill="none" /> {/* Dish curve */}
                        <line x1="30" y1="95" x2="30" y2="105" stroke="currentColor" strokeWidth="0.5" /> {/* Receiver */}
                        <circle cx="30" cy="105" r="1" />


                        {/* --- SOLAR ARRAYS (Bottom Wing) --- */}
                        {/* Connecting Truss Bottom */}
                        <rect x="28" y="90" width="4" height="5" fill="currentColor" opacity="0.8" /> {/* Behind Dish somewhat */}
                        <g transform="translate(10, 100)">
                            {/* Shifted down to avoid dish overlap visually */}
                            <rect x="0" y="0" width="40" height="25" fill="#ff5500" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" />
                            {/* Grid */}
                            <path d="M0,5 H40 M0,10 H40 M0,15 H40 M0,20 H40" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
                            <path d="M10,0 V25 M20,0 V25 M30,0 V25" stroke="currentColor" strokeWidth="0.2" opacity="0.5" />
                        </g>

                    </svg>

                    {/* Nav Lights */}
                    <div className="absolute top-[30%] left-[40%] w-1 h-1 bg-white rounded-full animate-ping" />
                    <div className="absolute bottom-[30%] right-[40%] w-1 h-1 bg-red-500 rounded-full animate-pulse delay-75" />
                </div>
            </div>

            <style jsx>{`
                .writing-vertical-rl {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                }
                @keyframes hover-float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                }
                .animate-hover-float {
                    animation: hover-float 8s ease-in-out infinite;
                }
                @keyframes scan-slow {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .animate-scan-slow {
                    animation: scan-slow 4s linear infinite;
                }
            `}</style>
        </div>
    );
}
