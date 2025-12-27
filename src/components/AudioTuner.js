"use client";
import React, { useEffect, useRef } from "react";
import { useAudio } from "../context/AudioContext";

export default function AudioTuner() {
    const { isMuted, toggleMute } = useAudio();
    const canvasRef = useRef(null);

    // ANIMATION LOOP (Waveform Visualization)
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrame;
        let step = 0;

        const draw = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set Style
            ctx.strokeStyle = "#C1440E"; // Mars Red
            ctx.lineWidth = 2;
            ctx.beginPath();

            const width = canvas.width;
            const height = canvas.height;
            const amplitude = isMuted ? 2 : 10; // Flatline vs Active Jitter
            const frequency = 0.2;

            // Draw the wave
            for (let x = 0; x <= width; x += 2) {
                // Calculate Y based on Sine wave + Noise
                let y = height / 2;
                if (!isMuted) {
                    // Active: Sine wave multiplied by random noise for "Voice Print" look
                    y += Math.sin((x + step) * frequency) * amplitude * Math.random();
                } else {
                    // Muted: Very subtle flatline pulse
                    y += Math.sin((x + step) * 0.5) * 1;
                }

                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }

            ctx.stroke();

            step += 2; // Speed of the wave
            animationFrame = requestAnimationFrame(draw);
        };

        // Initialize Canvas Size
        canvas.width = 60;
        canvas.height = 30;

        draw();

        return () => cancelAnimationFrame(animationFrame);
    }, [isMuted]);

    return (
        <button
            onClick={toggleMute}
            // Added 'mix-blend-difference' to ensure text is visible on ANY background color
            className="fixed bottom-16 left-8 md:left-16 z-[8000] flex items-center gap-3 cursor-pointer group mix-blend-difference"
            title={isMuted ? "Enable Audio Uplink" : "Silence Comms"}
        >
            {/* 1. THE WAVEFORM CANVAS */}
            <canvas
                ref={canvasRef}
                className="w-[60px] h-[30px]"
            />

            {/* 2. THE LABEL (Vertical Slide Transition) */}
            <div className="flex flex-col items-start overflow-hidden h-3 w-10">
                <div className={`transition-transform duration-300 ${isMuted ? "-translate-y-3" : "translate-y-0"}`}>
                    {/* Active State */}
                    <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#C1440E] h-3 leading-3">
                        LIVE
                    </span>
                    {/* Muted State */}
                    <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-[#C1440E]/60 h-3 leading-3">
                        MUTE
                    </span>
                </div>
            </div>
        </button>
    );
}