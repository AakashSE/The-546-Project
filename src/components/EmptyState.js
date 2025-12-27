"use client";
import React from 'react';

// Variants: "cart", "search", "void"
export default function EmptyState({ type = "void", message = "NO DATA FOUND" }) {
    return (
        <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center p-8 select-none opacity-60 hover:opacity-100 transition-opacity duration-500">
            {/* ANIMATED VISUAL */}
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                {/* Orbital Rings */}
                <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 border border-[#C1440E]/30 rounded-full animate-[spin_6s_linear_infinite_reverse]" style={{ borderStyle: 'dashed' }} />

                {/* Center Icon based on Type */}
                <div className="text-4xl text-[#C1440E] animate-pulse">
                    {type === "cart" && "📦"}
                    {type === "search" && "🔍"}
                    {type === "void" && "∅"}
                </div>

                {/* Radar Scan */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-[#C1440E]/10 to-transparent animate-spin duration-[3s] ease-linear" />
            </div>

            {/* TEXT */}
            <h3 className="type-heading text-[#C1440E] mb-2">{message}</h3>
            <p className="type-caption animate-pulse">
                SCANNING SECTOR... 0 RESULTS
            </p>
        </div>
    );
}
