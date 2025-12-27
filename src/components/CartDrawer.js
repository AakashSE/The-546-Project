"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useCart } from "../context/CartContext";
import useMarsSound from "../hooks/useMarsSound";
import useCloseAudio from "../hooks/useCloseAudio"; // NEW HOOK
import { useTransition } from "../context/TransitionContext"; // NEW
import EmptyState from "./EmptyState";

export default function CartDrawer() {
    const { cart, isCartOpen, toggleCart, removeFromCart } = useCart();
    const drawerRef = useRef(null);
    const overlayRef = useRef(null);
    const { navigateWithTransition } = useTransition(); // HOOK

    const [jettisoningItems, setJettisoningItems] = useState([]);

    const { playSound: playJettison } = useMarsSound("/assets/Jettison.mp3");
    const { playSound: playDocking } = useMarsSound("/assets/Docking.mp3");
    // const { playSound: playClose } = useMarsSound("/assets/Close.mp3"); // REMOVED
    const { playClose } = useCloseAudio(); // REPLACED

    useEffect(() => {
        if (isCartOpen) {
            gsap.to(overlayRef.current, { autoAlpha: 1, duration: 0.5 });
            gsap.to(drawerRef.current, { x: "0%", duration: 0.6, ease: "power4.out" });
        } else {
            gsap.to(overlayRef.current, { autoAlpha: 0, duration: 0.5 });
            gsap.to(drawerRef.current, { x: "100%", duration: 0.6, ease: "power4.inOut" });
        }
    }, [isCartOpen]);

    const total = cart.reduce((acc, item) => {
        const priceString = String(item.price || "0");
        const priceNumber = parseInt(priceString.replace(/[^\d]/g, "")) || 0;
        return acc + priceNumber;
    }, 0);
    const formattedTotal = total.toLocaleString("en-IN");

    const payloadWeight = cart.reduce((acc, item) => acc + (item.weight || 0.5), 0).toFixed(2);

    const maxCapacity = 10.0;
    const capacityPercent = Math.min((payloadWeight / maxCapacity) * 100, 100);

    const handleJettison = (uniqueId) => {
        playJettison();
        setJettisoningItems((prev) => [...prev, uniqueId]);
        setTimeout(() => {
            removeFromCart(uniqueId);
            setJettisoningItems((prev) => prev.filter((id) => id !== uniqueId));
        }, 800);
    };

    const handleTransport = () => {
        // playDocking(); // Handled by transition or manually
        toggleCart();
        navigateWithTransition("/checkout", playDocking);
    };

    const handleClose = () => {
        playClose();
        toggleCart();
    };

    return (
        <>
            <div
                ref={overlayRef}
                onClick={handleClose}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9990] invisible opacity-0 cursor-crosshair"
            />

            <div
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#0a0a0a] text-white z-[9991] translate-x-full border-l-2 border-[#C1440E] shadow-2xl flex flex-col"
            >
                <div className="bg-[#111] p-8 border-b border-white/10 relative">
                    <button
                        onClick={handleClose}
                        className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center border-l border-b border-white/10 hover:bg-[#C1440E] hover:text-black hover:border-transparent transition-all duration-300 group z-50 cursor-pointer"
                        title="Close Manifest"
                    >
                        <div className="relative w-6 h-6 group-hover:rotate-90 transition-transform duration-500 ease-out">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-current rotate-45" />
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-current -rotate-45" />
                        </div>
                    </button>

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                                SUPPLY CRATE
                                <span className="text-[10px] bg-[#C1440E] text-black px-2 py-0.5 rounded-sm font-bold tracking-widest">
                                    LIVE
                                </span>
                            </h2>
                            <p className="text-[10px] text-white/40 font-mono mt-1 tracking-widest">
                                SECTOR 7 LOGISTICS
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-1 bg-white/10 mt-4 relative">
                        <div
                            className="absolute top-0 left-0 h-full bg-[#C1440E] transition-all duration-500"
                            style={{ width: `${capacityPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono text-[#C1440E] mt-2 tracking-widest">
                        <span>PAYLOAD: {payloadWeight} KG</span>
                        <span>CAPACITY: {maxCapacity} KG</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white/5">
                    {cart.length === 0 ? (
                        <EmptyState type="cart" message="CONTAINER VOID" />
                    ) : (
                        cart.map((item, index) => {
                            const key = item.uniqueId || `item-${index}`;
                            const isGlitching = jettisoningItems.includes(key);

                            return (
                                <div
                                    key={key}
                                    className={`relative flex gap-4 p-4 bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-200 group
                                        ${isGlitching ? "animate-glitch border-red-500 text-red-500" : ""}
                                    `}
                                >
                                    <span className="absolute top-2 right-2 text-[8px] font-mono text-white/20">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </span>

                                    <div className="relative w-20 h-24 bg-black flex-shrink-0 border border-white/10">
                                        <Image
                                            src={item.image || item.selectedColor?.images?.front}
                                            alt={item.name}
                                            fill
                                            className={`object-cover ${isGlitching ? "grayscale contrast-150" : ""}`}
                                        />
                                    </div>

                                    <div className="flex flex-col justify-between flex-1">
                                        <div>
                                            <h3 className="text-sm font-bold uppercase tracking-wide">
                                                {isGlitching ? "DATA CORRUPTED" : item.name}
                                            </h3>

                                            <div className="flex items-center gap-2 mt-2">
                                                <span
                                                    className="w-3 h-3 rounded-full border border-white/20"
                                                    style={{ backgroundColor: item.selectedColor?.hex || item.hex }}
                                                />
                                                <span className="text-[10px] text-white/60 font-mono uppercase tracking-widest">
                                                    {item.selectedColor?.colorName || item.colorName}
                                                </span>
                                            </div>

                                            {/* NEW: SIZE DISPLAY */}
                                            <div className="flex justify-between items-center mt-1">
                                                <p className="text-[9px] font-mono text-white/30">
                                                    MASS: {item.weight || 0.5} KG
                                                </p>
                                                {item.size && (
                                                    <p className="text-[10px] font-mono text-white/80 uppercase tracking-widest border border-white/10 px-1">
                                                        SIZE: {item.size}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end mt-2">
                                            <span className="font-mono text-sm tracking-tighter">
                                                {item.price}
                                            </span>
                                            <button
                                                disabled={isGlitching}
                                                onClick={() => handleJettison(item.uniqueId || item.id)}
                                                className="text-[8px] uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:underline decoration-red-500 disabled:opacity-0 transition-all cursor-pointer"
                                            >
                                                // JETTISON
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-8 border-t border-white/10 bg-[#050505] relative z-10">
                    <div className="flex justify-between items-end mb-6 font-mono border-b border-white/10 pb-4">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">Total Value</span>
                        <span className="text-2xl font-bold tracking-tighter text-[#C1440E]">₹{formattedTotal}</span>
                    </div>

                    <button
                        onClick={handleTransport}
                        disabled={cart.length === 0}
                        className="w-full bg-white text-black py-5 font-black uppercase tracking-[0.25em] hover:bg-[#C1440E] hover:text-white transition-all duration-300 relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-4">
                            <span>INITIATE TRANSPORT</span>
                            <span className="text-lg group-hover:translate-x-2 transition-transform">→</span>
                        </span>
                        <div className="absolute inset-0 bg-[#C1440E] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out z-0" />
                    </button>

                    <div className="mt-4 flex justify-between text-[8px] uppercase tracking-widest text-white/20 font-mono">
                        <span>Secure Link: ACTIVE</span>
                        <span>Auth: AAKASH.SE</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes glitch-anim {
                    0% { transform: translate(0); opacity: 1; }
                    20% { transform: translate(-2px, 2px); opacity: 0.8; }
                    40% { transform: translate(2px, -2px); opacity: 0.4; }
                    60% { transform: translate(-2px, 2px); opacity: 0.6; }
                    80% { transform: translate(2px, -2px); opacity: 0.2; }
                    100% { transform: translate(0); opacity: 0; display: none;}
                }
                .animate-glitch {
                    animation: glitch-anim 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                }
            `}</style>
        </>
    );
}