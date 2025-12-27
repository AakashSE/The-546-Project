"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import TransitionLink from "./TransitionLink";
import { products } from "../data/products";
import useMarsSound from "../hooks/useMarsSound";

export default function OrbitalMenu({ isOpen, onClose }) {
    const { playSound: playHover } = useMarsSound("/assets/Mars_Audio.mp3");
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");

    // Note: 'playClose' isn't needed here if the header handles the closing action via prop
    // but we keep the logic for link clicks.

    const menuRef = useRef(null);
    const navRef = useRef(null);
    const [activeImage, setActiveImage] = useState(null);

    // Staggered Entry
    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(navRef.current.children,
                { y: 100, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 1, stagger: 0.1, ease: "power4.out", delay: 0.3 }
            );
        }
    }, [isOpen]);

    const handleMagneticMove = (e) => {
        const target = e.currentTarget;
        const text = target.querySelectorAll('.magnetic-text');
        const { clientX, clientY } = e;
        const { left, top, width, height } = target.getBoundingClientRect();

        const x = (clientX - (left + width / 2)) * 0.5; // Magnetic Pull
        const y = (clientY - (top + height / 2)) * 0.8;

        gsap.to(target, { x: x * 0.5, y: y * 0.5, duration: 1, ease: "power3.out" });
        gsap.to(text, { x: x, y: y, duration: 1, ease: "power3.out" });
    };

    const handleMagneticLeave = (e) => {
        const target = e.currentTarget;
        const text = target.querySelectorAll('.magnetic-text');
        gsap.to([target, text], { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
    };

    const MENU_ITEMS = [
        {
            label: "Armory",
            href: "/armory",
            sub: "Full Inventory",
            image: products[0]?.options[0]?.images?.back // Use back for variation? Or Front.
        },
        {
            label: "Intel",
            href: "/intel",
            sub: "Mission Brief",
            image: products[1]?.options[0]?.images?.front
        },
        {
            label: "Comms",
            href: "/comms",
            sub: "Establish Link",
            image: products[2]?.options[0]?.images?.front
        }
    ];

    return (
        <div
            className={`fixed inset-0 z-[150] bg-[#050505] transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] flex flex-col h-[100dvh] overflow-hidden
                ${isOpen ? "translate-y-0" : "-translate-y-full"}
            `}
        >

            {/* 1. HOLOGRAPHIC BACKGROUND PREVIEW */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-all duration-700 ease-out">
                {activeImage && (
                    <div className="relative w-full h-full animate-pulse">
                        <Image
                            src={activeImage}
                            alt="Preview"
                            fill
                            className="object-cover grayscale blur-sm scale-110"
                        />
                        <div className="absolute inset-0 bg-[#050505]/50" />
                    </div>
                )}
            </div>

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 z-10 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)`,
                    backgroundSize: "4rem 4rem"
                }}
            />

            {/* 2. THE COMMAND LIST - Centered with Spacer */}
            <div className="flex-1" />
            <nav ref={navRef} className="relative z-20 flex-none flex flex-col items-center gap-6 perspective-[1000px]">
                {MENU_ITEMS.map((item) => (
                    <TransitionLink
                        key={item.label}
                        href={item.href}
                        onClick={() => {
                            // playClick handled by TransitionLink
                            onClose();
                        }}
                        onMouseMove={handleMagneticMove} // MAGNETIC
                        onMouseLeave={(e) => {
                            handleMagneticLeave(e);
                            setActiveImage(null);
                        }}
                        onMouseEnter={(e) => {
                            playHover();
                            setActiveImage(item.image);
                        }}
                        className="group relative flex flex-col items-center cursor-none p-8"
                    >
                        {/* MAIN TEXT */}
                        <div className="magnetic-text relative z-10 transition-transform will-change-transform">
                            <span
                                className={`
                                    text-5xl md:text-7xl font-luxury italic font-black uppercase tracking-tighter transition-all duration-300
                                    ${activeImage === item.image ? "text-transparent bg-clip-text bg-gradient-to-r from-[#C1440E] to-white scale-110 pl-8" : "text-white/20 scale-100"}
                                    group-hover:text-white/40
                                `}
                            >
                                {item.label}
                            </span>
                        </div>

                        {/* SUB-LABEL - FLOATING */}
                        <div className={`magnetic-text absolute top-1/2 left-full ml-4 w-max -translate-y-1/2 flex items-center gap-2 transition-all duration-500 
                            ${activeImage === item.image ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                         `}>
                            <span className="w-8 h-[1px] bg-[#C1440E]" />
                            <span className="text-xs font-mono text-[#C1440E] tracking-[0.3em] uppercase">
                                {item.sub}
                            </span>
                        </div>
                    </TransitionLink>
                ))}
            </nav>
            {/* Footer Info - Flex Bottom */}
            <div className="flex-1 w-full flex items-end justify-center pb-8 z-20">
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.5em]">
                    System Status: Online
                </p>
            </div>

        </div>
    );
}