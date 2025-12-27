"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';
import { useSearchParams } from 'next/navigation';
import gsap from 'gsap';
import Header from './Header';
import MagneticButton from './MagneticButton';
import { useCart } from '../context/CartContext';
import useMarsSound from '../hooks/useMarsSound';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase/client';
import BioScanner from './BioScanner';
import Footer from './Footer';

// --- VISUALS: TOPOGRAPHIC CONTOURS (Mars Terrain) ---
// Animated contour lines that adapt to theme color
import dynamic from 'next/dynamic';
const HolographicBg = dynamic(() => import('./Product/HolographicWireframeBg'), { ssr: false });



// [EclipseBackground removed]

// [PriceAsset Component]
const PriceAsset = ({ price }) => (
    <div className="relative group select-none">
        {/* Glow effect behind */}
        <div className="absolute -inset-2 bg-[#C1440E] opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-700" />

        {/* Main Glass Container */}
        <div className="relative bg-[#0a0a0a] border-l-2 border-[#C1440E] pl-6 pr-8 py-4 flex items-center gap-5 transition-all duration-300 hover:pl-8">

            {/* Background Tech Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.03)_50%,transparent_100%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Left Rail: Status Indicator (Reshaped to avoid 'ball pin' look) */}
            <div className="flex flex-col justify-center h-10 gap-1">
                <div className="w-1.5 h-1.5 bg-[#C1440E] shadow-[0_0_8px_#C1440E] animate-pulse rounded-full" />
            </div>

            {/* Center: Price Typography (Google Sans / Sans-Serif) */}
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/40">
                        Acquisition Cost
                    </span>
                    <div className="h-[1px] w-8 bg-[#C1440E]/30" />
                </div>

                <span className="font-sans text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_20px_rgba(193,68,14,0.3)]" style={{ fontFamily: "'Google Sans', sans-serif" }}>
                    {price}
                </span>
            </div>

            {/* Right: Decorative Corner */}
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#C1440E]/50" />
        </div>
        <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap'); /* Fallback/Similar */
        `}</style>
    </div>
);

// --- UTIL: DECRYPT TEXT ---
const DecryptText = ({ text, className }) => {
    const [displayText, setDisplayText] = useState("");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";
    useEffect(() => {
        let iteration = 0;
        const interval = setInterval(() => {
            setDisplayText(() => text.split("").map((letter, index) => {
                if (index < iteration) return text[index];
                return chars[Math.floor(Math.random() * chars.length)];
            }).join(""));
            if (iteration >= text.length) clearInterval(interval);
            iteration += 1 / 3;
        }, 30);
        return () => clearInterval(interval);
    }, [text]);
    return <span className={className}>{displayText}</span>;
};

import NoiseOverlay from './NoiseOverlay';
import useTypingAudio from '../hooks/useTypingAudio';

export default function ProductPageClient({ product }) {
    const searchParams = useSearchParams();
    const { addToCart } = useCart();
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");
    // const { playSound: playScan } = useMarsSound("/assets/Mars_Audio.mp3"); // REMOVED
    const { playType } = useTypingAudio(); // NEW
    const { user, openAuth } = useAuth();

    // Use click sound for scan instead of ambience track
    const playScan = playClick;
    const { playSound: playAcquire } = useMarsSound("/assets/AcquireAsset.mp3");

    // --- STATE ---
    const urlColor = searchParams.get('color');
    const initialColor = useMemo(() => product?.options.find(o => o.colorName.toLowerCase() === urlColor?.toLowerCase()) || product?.options[0], [product, urlColor]);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [selectedSize, setSelectedSize] = useState("M");
    const [selectedView, setSelectedView] = useState("front");
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const VIEW_ORDER = ["front", "side", "back", "detail", "flat"];

    const toggleExpand = () => {
        playScan();
        setIsExpanded(!isExpanded);
    };

    const nextView = (e) => {
        e.stopPropagation();
        playClick();
        const currentIndex = VIEW_ORDER.indexOf(selectedView);
        const nextIndex = (currentIndex + 1) % VIEW_ORDER.length;
        setSelectedView(VIEW_ORDER[nextIndex]);
    };

    const prevView = (e) => {
        e.stopPropagation();
        playClick();
        const currentIndex = VIEW_ORDER.indexOf(selectedView);
        const prevIndex = (currentIndex - 1 + VIEW_ORDER.length) % VIEW_ORDER.length;
        setSelectedView(VIEW_ORDER[prevIndex]);
    };

    // Reviews
    const [realReviews, setRealReviews] = useState([]);
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(5);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    // Sync Color
    useEffect(() => { if (initialColor && !selectedColor) setSelectedColor(initialColor); }, [initialColor]);

    // Fetch Reviews
    useEffect(() => {
        if (!product) return;
        const fetchReviews = async () => {
            const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false });
            if (data) setRealReviews(data);
        };
        fetchReviews();
    }, [product]);

    const handleSubmitReview = async () => {
        if (!user) { playClick(); openAuth(); return; }
        if (!reviewText.trim()) return;
        setReviewSubmitting(true);
        const { error } = await supabase.from('reviews').insert({
            product_id: product.id,
            user_id: user.id,
            username: user.user_metadata?.full_name || "UNKNOWN OPERATIVE",
            rating: rating,
            comment: reviewText
        });
        if (!error) {
            setReviewText("");
            const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false });
            if (data) setRealReviews(data);
        }
        setReviewSubmitting(false);
    };

    if (!product || !selectedColor) return null;
    const currentImage = selectedColor.images[selectedView] || selectedColor.images.front;

    return (
        <div className="relative w-full min-h-screen bg-[#050505] text-white font-inter selection:bg-[#C1440E] selection:text-black scroll-smooth">
            {/* AudioAmbience is Global */}

            {/* Expanded Backdrop */}
            <div
                className={`fixed inset-0 z-[40] bg-black/95 backdrop-blur-xl transition-opacity duration-500 ${isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={toggleExpand}
            />

            {/* EXPANDED IMAGE OVERLAY (Root Level to Escape Stacking Contexts) */}
            <div className={`fixed inset-0 z-[50] flex items-center justify-center pointer-events-none ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                <div className={`relative w-[90vw] h-[90vh] transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${isExpanded ? "scale-100 translate-y-0" : "scale-90 translate-y-10"}`}>
                    {isExpanded && (
                        <Image
                            key={`expanded-${currentImage}`}
                            src={currentImage}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-[0_0_100px_rgba(193,68,14,0.3)]"
                            priority
                        />
                    )}

                    {/* CONTROLS (Delayed) */}
                    <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 delay-500 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
                        <button
                            onClick={prevView}
                            className="absolute top-1/2 -left-4 lg:left-8 -translate-y-1/2 p-4 text-white/50 hover:text-[#C1440E] hover:scale-125 transition-all pointer-events-auto"
                        >
                            <svg className="w-12 h-12 lg:w-16 lg:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button
                            onClick={nextView}
                            className="absolute top-1/2 -right-4 lg:right-8 -translate-y-1/2 p-4 text-white/50 hover:text-[#C1440E] hover:scale-125 transition-all pointer-events-auto"
                        >
                            <svg className="w-12 h-12 lg:w-16 lg:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1" d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <div className="absolute bottom-8 left-0 right-0 text-center">
                            <span className="text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#C1440E] bg-black/80 px-6 py-3 border border-white/10">{selectedView} VIEW</span>
                        </div>
                    </div>
                </div>
            </div>

            <Header theme="dark" />

            {/* --- GLOBAL BACKGROUND --- */}
            <HolographicBg themeColor={selectedColor?.hex || '#C1440E'} />

            {/* --- FRAME 1: HERO (100vh / Initial View) --- */}
            {/* Strict Grid Layout: Left (Image) | Right (Data) */}
            <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-8 lg:p-16 box-border overflow-hidden">
                <div className="w-full max-w-[1600px] h-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 items-center">

                    {/* LEFT COL: PRODUCT VISUAL */}
                    <div className="w-full h-full flex flex-col items-center justify-center relative group">
                        {/* IN-LINE IMAGE CONTAINER (Hidden when Expanded) */}
                        <div
                            onClick={toggleExpand}
                            className={`
                                relative flex items-center justify-center transition-all duration-300 z-[10]
                                ${isExpanded ? "opacity-0 pointer-events-none scale-90" : "opacity-100 w-full max-w-[420px] aspect-[4/5] cursor-zoom-in hover:scale-105 hover:-translate-y-2"}
                            `}
                        >
                            {/* Holo-Bracket: Top Left */}
                            <div className={`absolute -top-4 -left-4 w-8 h-8 border-t border-l border-[#C1440E]/40 transition-opacity duration-300 ${isExpanded ? "opacity-0" : "opacity-100"}`} />

                            <div className={`w-full h-full relative ${!isExpanded ? "animate-[subtle-breathe_6s_ease-in-out_infinite]" : ""}`}>
                                <Image
                                    key={currentImage}
                                    src={currentImage}
                                    alt={product.name}
                                    fill
                                    className="object-cover drop-shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
                                    priority
                                />
                            </div>

                            {/* Holo-Bracket: Bottom Right */}
                            <div className={`absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-[#C1440E]/40 transition-opacity duration-300 ${isExpanded ? "opacity-0" : "opacity-100"}`} />
                        </div>

                        {/* View Selector (Floating Strip) */}
                        <div className={`mt-12 flex gap-8 justify-center w-full transition-opacity duration-500 ${isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                            {VIEW_ORDER.map((view) => (
                                <button
                                    key={view}
                                    onClick={() => { playClick(); setSelectedView(view); }}
                                    className={`
                                        text-[10px] uppercase tracking-[0.25em] font-mono py-1 border-b transition-all
                                        ${selectedView === view
                                            ? "border-[#C1440E] text-white shadow-[0_5px_15px_rgba(193,68,14,0.2)]"
                                            : "border-transparent text-white/80 hover:text-white hover:border-white/20"
                                        }
                                    `}
                                >
                                    {view}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COL: DATA MANIFEST */}
                    <div className="w-full h-full flex flex-col justify-center lg:pl-24 relative">
                        {/* Decorative Line (Spine) */}
                        <div className="hidden lg:block absolute left-0 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                        <div className="space-y-10 max-w-lg">
                            {/* Title Block */}
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-2 h-2 bg-[#C1440E] animate-pulse" />
                                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Mars Archive // 04</span>
                                </div>
                                <h1 className="text-6xl lg:text-8xl font-black uppercase leading-[0.8] tracking-tighter text-white mb-4">
                                    <DecryptText text={product.name} />
                                </h1>
                                <p className="font-mono text-xs text-[#C1440E] uppercase tracking-widest pl-2 border-l-2 border-[#C1440E]/30">
                                    "{product.slogan}"
                                </p>
                            </div>

                            {/* Info Block (Glass Panel) */}
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-8 relative">
                                <div className="absolute top-0 right-0 p-2"><div className="w-1 h-1 bg-white/20 rounded-full" /></div>
                                <div className="absolute top-0 right-0 p-2"><div className="w-1 h-1 bg-white/20 rounded-full" /></div>
                                <h3 className="text-[9px] uppercase tracking-widest text-[#C1440E] mb-4 font-mono">Specs</h3>
                                <p className="text-sm leading-7 text-white/70 font-light text-justify">
                                    {product.description || "Forged in the pressurised fabricators of Colony One. This garment features high-tensile polymer weaving for radiation shielding and abrasion resistance, standard-issue for all personnel operating in Sector 4."}
                                </p>
                            </div>

                            {/* Action Block */}
                            <div className="space-y-8 pt-4">
                                <div className="flex items-end justify-between border-b border-white/10 pb-6">
                                    <div>
                                        <PriceAsset price={product.price} />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="text-[9px] uppercase tracking-widest text-[#C1440E] font-mono">
                                            Color // <span className="text-white">{selectedColor.colorName}</span>
                                        </span>
                                        <div className="flex items-center gap-3">
                                            {product.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { playClick(); setSelectedColor(opt); setSelectedView("front"); }}
                                                    className={`w-4 h-4 transition-all border border-white/40 ${selectedColor.colorName === opt.colorName ? "ring-2 ring-[#C1440E] ring-offset-2 ring-offset-black" : "opacity-80 hover:opacity-100"}`}
                                                    style={{ backgroundColor: opt.hex }}
                                                    title={opt.colorName}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button onClick={() => setIsScannerOpen(true)} className="px-6 py-4 border border-white/20 text-[10px] items-center justify-center font-mono uppercase tracking-widest text-white/50 hover:text-white hover:border-white transition-all">
                                        Fit: {selectedSize}
                                    </button>
                                    <div className="flex-1">
                                        <MagneticButton
                                            onClick={() => {
                                                playAcquire();

                                                // 2. Add to Cart Logic
                                                if ((product.stock_quantity ?? 10) > 0) addToCart({ ...product, size: selectedSize }, selectedColor, product.price);
                                            }}
                                            className="w-full py-4 bg-[#C1440E] text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-white hover:text-black transition-all shadow-[0_0_50px_rgba(193,68,14,0.3)] clip-path-slant flex items-center justify-center cursor-pointer border-none"
                                        >
                                            Acquire Asset
                                        </MagneticButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* --- FRAME 2: LOGS (Standalone Console) --- */}
            <div className="relative z-10 w-full bg-transparent snap-start pt-20 lg:pt-28">
                <div className="w-full max-w-[1400px] h-[35vh] min-h-[300px] mx-auto px-6 lg:px-0 flex flex-col mb-8">

                    {/* Standalone Header */}
                    <div className="shrink-0 flex items-center gap-4 mb-4 pl-1">
                        <div className="w-2 h-2 bg-[#C1440E] animate-pulse" />
                        <h2 className="text-xl font-black uppercase tracking-tighter text-white">COMMAND CONSOLE</h2>
                        <span className="text-[#C1440E] font-mono text-[9px] tracking-widest ml-auto">[ SIGNAL STRENGTH: 100% ]</span>
                    </div>

                    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* LEFT CARD: COMPOSER */}
                        <div className="lg:col-span-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-5 flex flex-col shadow-[0_0_20px_rgba(193,68,14,0.15)] min-h-0 container-query">
                            <h3 className="shrink-0 text-[10px] uppercase tracking-[0.2em] text-[#C1440E] mb-3 font-mono">
                                New Entry
                            </h3>

                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                onKeyDown={() => playType()}
                                placeholder="INITIATE MESSAGE SEQUENCE..."
                                className="flex-1 w-full bg-black/50 border border-white/10 p-3 text-[10px] font-mono text-[#C1440E] focus:border-[#C1440E] focus:outline-none focus:bg-black/80 resize-none mb-3 placeholder:text-white/20 transition-all scrollbar-hide min-h-0"
                            />

                            <div className="shrink-0 flex justify-between items-center gap-2">
                                <div className="flex gap-1 bg-black/50 p-1 border border-white/5 rounded">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => { playClick(); setRating(s); }}
                                            className={`w-6 h-6 flex items-center justify-center transition-all hover:bg-white/10 ${s <= rating ? "text-[#C1440E]" : "text-white/20"}`}
                                        >
                                            <svg className="w-3 h-3" fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={reviewSubmitting || !reviewText.trim()}
                                    className="flex-1 py-1.5 bg-white text-black font-bold text-[9px] uppercase tracking-[0.2em] hover:bg-[#C1440E] transition-all disabled:opacity-50 disabled:cursor-not-allowed clip-path-slant rounded-sm"
                                >
                                    {reviewSubmitting ? "SENDING..." : "UPLOAD"}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT CARD: FEED */}
                        <div className="lg:col-span-8 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-0 flex flex-col shadow-[0_0_20px_rgba(193,68,14,0.15)] overflow-hidden min-h-0 container-query">
                            <div className="shrink-0 flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                                <span className="text-[9px] font-mono uppercase text-white/50">INCOMING FEED</span>
                                <span className="text-[9px] font-mono uppercase text-[#C1440E]">LIVE</span>
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-hide p-0">
                                {realReviews.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center opacity-30">
                                        <div className="w-6 h-6 border-2 border-dashed border-white rounded-full animate-spin mb-2" />
                                        <span className="font-mono text-[9px]">SCANNING SECTOR FREQUENCIES...</span>
                                    </div>
                                )}
                                {realReviews.map((rev, idx) => (
                                    <div key={rev.id} className="group border-b border-white/5 p-4 hover:bg-white/5 transition-colors relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#C1440E] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-6 h-6 bg-white/10 rounded text-[9px] font-bold text-[#C1440E] flex items-center justify-center">
                                                    {rev.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <span className="block text-[10px] font-bold uppercase tracking-widest text-white group-hover:text-[#C1440E] transition-colors">{rev.username}</span>
                                                    <span className="text-[8px] font-mono text-white/30">SECTOR 7 • {new Date(rev.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-[1px]">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`w-1 h-2 ${i < rev.rating ? "bg-[#C1440E]" : "bg-white/10"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-white/70 font-light leading-relaxed pl-9 group-hover:text-white transition-colors">
                                            "{rev.comment}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
                <Footer />
            </div>



            <BioScanner isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onSelect={setSelectedSize} />
            {/* Global Styles for Breathe Animation */}
            <style jsx global>{`
                @keyframes subtle-breathe {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-10px) scale(1.02); }
                }
            `}</style>
        </div >
    );
}

