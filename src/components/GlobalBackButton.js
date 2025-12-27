"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import useMarsSound from "../hooks/useMarsSound";
import useCloseAudio from "../hooks/useCloseAudio"; // NEW HOOK

export default function GlobalBackButton() {
    const router = useRouter();
    const pathname = usePathname();
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");
    const { playClose } = useCloseAudio(); // NEW

    // Don't show on home page
    if (pathname === "/") return null;

    const handleBack = () => {
        playClose(); // Changed to Close sound
        router.back();
    };

    return (
        <button
            onClick={handleBack}
            className="fixed top-24 left-8 md:left-16 flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50 hover:text-[#C1440E] transition-colors z-[9999] group mix-blend-difference"
        >
            <span className="w-4 h-[1px] bg-current transition-all group-hover:w-8" />
            RETURN
        </button>
    );
}
