"use client";
import React, { useEffect, useState } from 'react';

export default function NoiseOverlay() {
    const [isFlickering, setIsFlickering] = useState(false);

    useEffect(() => {
        // Occasional Ghost HUD Flicker
        const flickerInterval = setInterval(() => {
            if (Math.random() > 0.8) {
                setIsFlickering(true);
                setTimeout(() => setIsFlickering(false), 150);
            }
        }, 3000);
        return () => clearInterval(flickerInterval);
    }, []);

    return (
        <div className={`fixed inset-0 pointer-events-none z-[80] overflow-hidden transition-opacity duration-300 ${isFlickering ? 'opacity-[0.12]' : 'opacity-[0.06]'}`}>
            {/* 1. TEXTURE NOISE */}
            <svg className="absolute inset-0 w-full h-full mix-blend-overlay">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" stitchTiles="stitch" numOctaves="3" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>

            {/* 2. GHOST SCANLINES */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[size:100%_3px,3px_100%] pointer-events-none" />

            {/* 3. OPTICAL FRINGE (Chromatic Aberration feel) */}
            <div className={`absolute inset-0 border-[20px] border-transparent transition-all duration-300 ${isFlickering ? 'border-cyan-500/5 blur-md' : 'border-transparent'}`} />

            <style jsx>{`
                div {
                    animation: noise-shift 0.1s infinite;
                }
                @keyframes noise-shift {
                    0% { transform: translate(0, 0); }
                    50% { transform: translate(-1%, 1%); }
                    100% { transform: translate(1%, -1%); }
                }
            `}</style>
        </div>
    );
}

