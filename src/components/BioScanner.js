"use client";
import React, { useState, useEffect, useRef } from "react";
import useMarsSound from "../hooks/useMarsSound";
import useCloseAudio from "../hooks/useCloseAudio"; // NEW HOOK

// --- SUB-COMPONENT: ENERGY BAR ---
const EnergyBar = ({ label, value, min, max, onChange, unit }) => {
    const bars = 20;
    const isDragging = useRef(false);

    // Calculate how many bars to fill
    const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
    const activeBars = Math.round((percentage / 100) * bars);

    const handleInteraction = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        // Support Touch or Mouse
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;

        const relativeX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const newValue = Math.round(min + relativeX * (max - min));
        onChange(newValue);
    };

    return (
        <div className="space-y-3 select-none">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono text-[#C1440E] uppercase tracking-widest">{label}</span>
                <span className="text-xl font-bold font-mono nums-tabular">{value}<span className="text-xs ml-1 text-white/50">{unit}</span></span>
            </div>

            {/* BAR CONTAINER */}
            <div
                className="w-full h-8 flex gap-1 cursor-crosshair relative group"
                onMouseDown={(e) => { isDragging.current = true; handleInteraction(e); }}
                onMouseMove={(e) => { if (isDragging.current) handleInteraction(e); }}
                onMouseUp={() => isDragging.current = false}
                onMouseLeave={() => isDragging.current = false}
                onTouchStart={(e) => { isDragging.current = true; handleInteraction(e); }}
                onTouchMove={(e) => { if (isDragging.current) handleInteraction(e); }}
                onTouchEnd={() => isDragging.current = false}
            >
                {Array.from({ length: bars }).map((_, i) => (
                    <div
                        key={i}
                        className={`flex-1 h-full transition-all duration-100 
                            ${i < activeBars
                                ? "bg-[#C1440E] shadow-[0_0_8px_#C1440E]"
                                : "bg-white/5 group-hover:bg-white/10"
                            }
                            ${i === activeBars - 1 ? "animate-pulse" : ""}
                        `}
                    />
                ))}
            </div>
        </div>
    );
};

export default function BioScanner({ isOpen, onClose, onSelect }) {
    const [height, setHeight] = useState(175); // cm
    const [weight, setWeight] = useState(70); // kg
    const [size, setSize] = useState("M");
    const [scanning, setScanning] = useState(false);

    const { playSound: playScan } = useMarsSound("/assets/Mars_Audio.mp3");
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");
    const { playSound: playLock } = useMarsSound("/assets/AcquireAsset.mp3");
    const { playClose } = useCloseAudio(); // NEW

    // --- CALCULATION LOGIC ---
    useEffect(() => {
        if (!isOpen) return;

        setScanning(true);
        const timer = setTimeout(() => setScanning(false), 500);

        let rec = "M";
        if (height < 170 && weight < 65) rec = "S";
        else if (height > 185 || weight > 90) rec = "XL";
        else if (height > 180 || weight > 80) rec = "L";
        else rec = "M";

        setSize(rec);
        return () => clearTimeout(timer);
    }, [height, weight, isOpen]);

    const handleConfirm = () => {
        playLock();
        onSelect(size); // Send size back to parent
        onClose();
    };

    if (!isOpen) return null;

    // SCALING FOR VISUALIZER
    const scaleY = 0.8 + ((height - 150) / 60) * 0.4; // 0.8 to 1.2
    const scaleX = 0.8 + ((weight - 40) / 80) * 0.4;  // 0.8 to 1.2

    return (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => { playClose(); onClose(); }}
            />

            {/* SCANNER INTERFACE */}
            <div className="relative w-full max-w-lg bg-[#050505] border border-[#C1440E]/30 shadow-[0_0_80px_rgba(193,68,14,0.15)] p-0 flex flex-col overflow-hidden">

                {/* DECORATIVE CORNERS */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#C1440E]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#C1440E]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#C1440E]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#C1440E]" />

                {/* TITLE BAR */}
                <div className="bg-white/5 px-8 py-4 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#C1440E] animate-ping" />
                        <h2 className="text-white font-mono text-xs uppercase tracking-[0.2em]">
                            Sub-Surface Scan
                        </h2>
                    </div>
                </div>

                <div className="p-8 flex gap-8">

                    {/* VISUALIZER (Left) */}
                    <div className="w-1/3 relative border border-white/10 bg-black flex items-center justify-center overflow-hidden">
                        {/* THE MANNEQUIN (CSS SHAPE) */}
                        <div
                            className="relative flex flex-col items-center transition-transform duration-500 ease-out"
                            style={{ transform: `scale(${scaleX}, ${scaleY})` }}
                        >
                            {/* Head */}
                            <div className="w-8 h-8 rounded-sm border border-[#C1440E]/80 bg-[#C1440E]/20 mb-1" />
                            {/* Torso */}
                            <div className="w-12 h-16 rounded-sm border border-[#C1440E]/80 bg-[#C1440E]/10 mb-1 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-[1px] bg-[#C1440E] animate-scan" />
                            </div>
                            {/* Legs */}
                            <div className="flex gap-1">
                                <div className="w-5 h-16 border border-[#C1440E]/80 bg-[#C1440E]/10" />
                                <div className="w-5 h-16 border border-[#C1440E]/80 bg-[#C1440E]/10" />
                            </div>
                        </div>

                        {/* Grid Overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                    </div>


                    {/* CONTROLS (Right) */}
                    <div className="flex-1 space-y-8 py-2">
                        <EnergyBar
                            label="Vertical Axis (Height)"
                            value={height} min={150} max={210}
                            unit="CM" onChange={setHeight}
                        />
                        <EnergyBar
                            label="Mass Density (Weight)"
                            value={weight} min={40} max={120}
                            unit="KG" onChange={setWeight}
                        />
                    </div>
                </div>

                {/* RESULT FOOTER */}
                <div className="bg-[#C1440E] p-4 flex justify-between items-center group cursor-pointer hover:bg-[#ff5500] transition-colors" onClick={handleConfirm}>
                    <div className="flex flex-col">
                        <span className="text-black/60 text-[9px] font-bold tracking-widest uppercase">Recommended Config</span>
                        <span className="text-black font-black text-2xl tracking-tighter">
                            {scanning ? "..." : `SIZE [ ${size} ]`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-black font-bold uppercase text-[10px] tracking-widest">
                        Initialize
                        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>

            </div>

            <style jsx>{`
                @keyframes scan {
                  0% { top: 0%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                  animation: scan 1.5s linear infinite;
                }
             `}</style>
        </div>
    );
}