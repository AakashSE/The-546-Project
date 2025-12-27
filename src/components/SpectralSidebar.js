"use client";
import React, { useRef, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useTransition } from "../context/TransitionContext";
import useMarsSound from "../hooks/useMarsSound";

const NAV_ITEMS = [
    { id: "armory", label: "Armory", href: "/armory", coord: "01" },
    { id: "intel", label: "Intel", href: "/intel", coord: "02" },
    { id: "comms", label: "Comms", href: "/comms", coord: "03" },
];

export default function SpectralSidebar() {
    const pathname = usePathname();
    const { navigateWithTransition } = useTransition();
    const { playSound: playHover } = useMarsSound("/assets/Mars_Audio.mp3");
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");

    const [hoveredItem, setHoveredItem] = useState(null);
    const containerRef = useRef(null);
    const lineRef = useRef(null);

    useEffect(() => {
        // Initial entrance animation
        gsap.fromTo(containerRef.current,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.5, ease: "expo.out", delay: 1 }
        );
    }, []);

    const handleMouseEnter = (id) => {
        setHoveredItem(id);
        playHover();
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const handleNavClick = (href) => {
        if (pathname === href) return;
        navigateWithTransition(href, playClick);
    };

    return (
        <div
            ref={containerRef}
            className="fixed right-6 top-44 z-[100] flex items-center gap-6 pointer-events-none"
        >
            {/* LABELS REVEALED ON HOVER */}
            <div className="flex flex-col items-end gap-12 text-right">
                {NAV_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        className={`transition-all duration-500 ease-out px-4
              ${hoveredItem === item.id ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
            `}
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-mono text-[#C1440E] tracking-[0.3em] uppercase leading-none mb-1">
                                {item.coord} //
                            </span>
                            <span className="text-xl font-luxury italic font-black uppercase text-white tracking-tighter">
                                {item.label}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* THE SPECTRAL LINE & NODES */}
            <div className="relative h-64 flex flex-col items-center justify-between pointer-events-auto group">
                {/* Main Spectral Line */}
                <div
                    ref={lineRef}
                    className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/10 group-hover:bg-white/30 transition-colors duration-500"
                />

                <div
                    className="absolute left-1/2 -track-x-1/2 w-[2px] bg-[#C1440E] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                        top: hoveredItem === "armory" ? "0%" : hoveredItem === "intel" ? "50%" : hoveredItem === "comms" ? "100%" : "50%",
                        height: hoveredItem ? "33%" : "0%",
                        opacity: hoveredItem ? 0.8 : 0,
                        transform: "translate(-50%, -16%)"
                    }}
                />

                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.href)}
                        onMouseEnter={() => handleMouseEnter(item.id)}
                        onMouseLeave={handleMouseLeave}
                        className="relative z-10 w-8 h-12 flex items-center justify-center group/node cursor-pointer"
                        aria-label={`Navigate to ${item.label}`}
                    >
                        {/* The Node Marker */}
                        <div className={`
              w-1.5 h-1.5 rotate-45 border border-white/40 transition-all duration-500
              ${hoveredItem === item.id ? "bg-[#C1440E] border-[#C1440E] scale-150 rotate-[225deg]" : "bg-transparent"}
              ${pathname === item.href ? "bg-white border-white scale-125" : ""}
              group-hover/node:border-white group-hover/node:scale-125
            `} />

                        {/* Holographic Pulse Ring */}
                        {hoveredItem === item.id && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border border-[#C1440E]/30 rounded-full animate-ping" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
