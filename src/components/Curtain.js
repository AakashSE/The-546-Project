"use client";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import useResonanceAudio from "../hooks/useResonanceAudio";

export default function Curtain() {
    const topShutterRef = useRef(null);
    const bottomShutterRef = useRef(null);
    const contentRef = useRef(null);
    const pathname = usePathname();
    const isFirstLoad = useRef(true);
    const { playResonance } = useResonanceAudio();

    // 'active' state determines if the curtain is visible (closing or fully closed)
    const [isActive, setIsActive] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    // Store resolve function to trigger after animation
    const pendingResolve = useRef(null);

    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        "AUDITING_BIO_SIGNATURE",
        "RE-ROUTING_NEURAL_LINK",
        "SYNCHRONIZING_ORBITAL_VECTOR",
        "CALIBRATING_Z_FOLD_TRANSIT",
        "ESTABLISHING_SECURE_UPLINK"
    ];

    useEffect(() => {
        let interval;
        if (isActive && !isLeaving) {
            interval = setInterval(() => {
                setStatusIndex((prev) => (prev + 1) % statuses.length);
            }, 150); // Rapid flicker for tech feel
        }
        return () => clearInterval(interval);
    }, [isActive, isLeaving]);

    useEffect(() => {
        if (isFirstLoad.current) {
            isFirstLoad.current = false;
            return;
        }

        const openCurtain = () => {
            if (!topShutterRef.current) return;
            setIsLeaving(true);
            const tl = gsap.timeline({
                onComplete: () => {
                    setIsActive(false);
                    setIsLeaving(false);
                }
            });

            tl.to(contentRef.current, { opacity: 0, duration: 0.3 })
                .to(topShutterRef.current, { y: "-100%", duration: 0.8, ease: "power4.inOut" }, 0)
                .to(bottomShutterRef.current, { y: "100%", duration: 0.8, ease: "power4.inOut" }, 0);
        };

        if (isActive && !isLeaving) {
            openCurtain();
        }

    }, [pathname]);

    // 2. CLOSE CURTAIN (Animation Trigger)
    useEffect(() => {
        // This effect runs once refs are ready after setIsActive(true)
        if (isActive && !isLeaving && topShutterRef.current && pendingResolve.current && !pendingResolve.current.started) {
            pendingResolve.current.started = true;

            const tl = gsap.timeline({
                onComplete: () => {
                    if (pendingResolve.current && pendingResolve.current.resolve) {
                        pendingResolve.current.resolve();
                    }
                }
            });

            gsap.set([topShutterRef.current, bottomShutterRef.current], { y: (i) => i === 0 ? "-100%" : "100%" });
            gsap.set(contentRef.current, { opacity: 0, scale: 0.8 });

            tl.to([topShutterRef.current, bottomShutterRef.current], { y: "0%", duration: 0.8, ease: "power4.inOut" })
                .to(contentRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, "-=0.2");
        }
    }, [isActive, isLeaving]);

    useEffect(() => {
        window.raiseCurtain = (direction = "next") => {
            return new Promise((resolve) => {
                pendingResolve.current = { resolve, started: false };
                setIsActive(true);
                playResonance("hiss", 0.4);

                // Safety Timeout: Ensure navigation happens even if animation hangs
                setTimeout(() => {
                    if (pendingResolve.current && pendingResolve.current.resolve) {
                        pendingResolve.current.resolve();
                        pendingResolve.current = null;
                    }
                }, 2000);
            });
        };
    }, [playResonance]);

    if (!isActive) return null;

    return (
        <div className="fixed inset-0 z-[99999] pointer-events-none flex flex-col justify-between overflow-hidden">

            {/* Top Shutter */}
            <div
                ref={topShutterRef}
                className="relative w-full h-1/2 bg-black border-b border-[#C1440E] shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-end justify-center pb-4"
            >
                {/* Tech Detail */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#C1440E] shadow-[0_0_15px_#C1440E]" />
                <div className="font-mono text-[8px] tracking-[0.3em] text-white/20 mb-2 uppercase">
                    SECTOR // 01 // INTERLOCK_ACTIVE
                </div>

                {/* Shutter Data Fragment (Left) */}
                <div className="absolute left-8 bottom-8 flex flex-col gap-1 opacity-20">
                    <span className="font-mono text-[6px] text-[#C1440E]">LAT: 45.321.002</span>
                    <span className="font-mono text-[6px] text-[#C1440E]">LNG: -12.449.11</span>
                    <div className="w-12 h-[1px] bg-[#C1440E]/40" />
                </div>
            </div>

            {/* Center Content */}
            <div ref={contentRef} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100000] flex flex-col items-center gap-6">
                <div className="w-[1px] h-12 bg-gradient-to-b from-[#C1440E] to-transparent animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.8em] text-[#C1440E] uppercase min-w-[300px] text-center">
                    {statuses[statusIndex]}
                </span>
                <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-1 h-3 bg-[#C1440E]/30 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            </div>

            {/* Bottom Shutter */}
            <div
                ref={bottomShutterRef}
                className="relative w-full h-1/2 bg-black border-t border-[#C1440E] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] flex items-start justify-center pt-4"
            >
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#C1440E] shadow-[0_0_15px_#C1440E]" />
                <div className="font-mono text-[8px] tracking-[0.3em] text-white/20 mt-2 uppercase">
                    LOGISTICS // ARCHIVE // ACCESSING
                </div>

                {/* Shutter Data Fragment (Right) */}
                <div className="absolute right-8 top-8 flex flex-col gap-1 opacity-20 items-end">
                    <span className="font-mono text-[6px] text-[#C1440E]">TEMP: -63.4 C</span>
                    <span className="font-mono text-[6px] text-[#C1440E]">ATMO: CO2/O2_MIX</span>
                    <div className="w-16 h-[1px] bg-[#C1440E]/40" />
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100001] pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />
        </div>
    );
}
