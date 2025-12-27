"use client";
import React, { useRef, useLayoutEffect, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Stars, PerspectiveCamera } from "@react-three/drei";
import TransitionLink from "../../components/TransitionLink"; // UPDATED
import Image from "next/image";
import gsap from "gsap";
import useMarsSound from "../../hooks/useMarsSound";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { supabase } from "../../utils/supabase/client";

// --- R3F BACKGROUND COMPONENTS ---
function TacticalGrid() {
    const gridRef = useRef();
    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
        }
    });
    return (
        <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -2, 0]}>
            <Grid
                ref={gridRef}
                args={[30, 30]}
                cellSize={1}
                cellThickness={1}
                cellColor="#333"
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor="#C1440E"
                fadeDistance={20}
                followCamera={false}
                infiniteGrid
            />
        </group>
    );
}

function ArmoryScene() {
    return (
        <>
            <color attach="background" args={["#050505"]} />
            <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
            <TacticalGrid />
            <ambientLight intensity={0.5} />
        </>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function ArmoryPage() {
    const containerRef = useRef();
    const titleRef = useRef();
    const cardsRef = useRef([]);

    const { playSound: playHover } = useMarsSound("/assets/Mars_Audio.mp3");
    const { playSound: playClick } = useMarsSound("/assets/ColourClick.mp3");

    // DATA STATE
    const [allProducts, setAllProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // FILTER STATE
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("ALL");
    const [sortMode, setSortMode] = useState("LATEST"); // LATEST, LOW_HIGH, HIGH_LOW

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('*');
            if (data) {
                setAllProducts(data);
            }
            setIsLoading(false);
        };
        fetchProducts();
    }, []);

    // --- FILTER LOGIC ---
    const filteredProducts = useMemo(() => {
        let result = [...allProducts];

        // 1. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.category?.toLowerCase().includes(q) ||
                p.description?.toLowerCase().includes(q)
            );
        }

        // 2. Category
        if (category !== "ALL") {
            if (category === "TOPS") {
                result = result.filter(p => ["Polo", "Shirt", "Tee"].some(k => p.category?.includes(k) || p.name.includes(k)));
            } else if (category === "BOTTOMS") {
                result = result.filter(p => ["Pant", "Shorts", "Trouser"].some(k => p.category?.includes(k) || p.name.includes(k)));
            }
            // Add more specific logic if needed
        }

        // 3. Sort
        if (sortMode === "LOW_HIGH") {
            result.sort((a, b) => {
                const pA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                const pB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                return pA - pB;
            });
        } else if (sortMode === "HIGH_LOW") {
            result.sort((a, b) => {
                const pA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
                const pB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
                return pB - pA;
            });
        } else {
            // LATEST (Changed to Ascending ID as requested)
            result.sort((a, b) => a.id - b.id);
        }

        return result;
    }, [allProducts, searchQuery, category, sortMode]);

    // --- THUMBNAIL LOGIC ---
    const getThumbnail = (product) => {
        const n = product.name.toLowerCase();
        // Renamed files to *_v2.png to bust cache properly without query strings
        if (n.includes('polo')) return "/assets/thumbnails/polo_v2.png";
        if (n.includes('shirt') && !n.includes('tee') && !n.includes('t-shirt')) return "/assets/thumbnails/shirt_v2.png";
        if (n.includes('shorts')) return "/assets/thumbnails/shorts_v2.png";
        if (n.includes('track') || n.includes('jogger')) return "/assets/thumbnails/track_v2.png";
        if (n.includes('tee') || n.includes('t-shirt')) return "/assets/thumbnails/tee_v2.png";
        if (n.includes('pant') || n.includes('trouser')) return "/assets/thumbnails/pant_v2.png";
        return product.defaultImage || (product.options && product.options[0]?.images?.front) || "/assets/placeholder.png";
    };

    // --- ANIMATIONS ---
    useLayoutEffect(() => {
        if (isLoading) return;
        const ctx = gsap.context(() => {
            const tl = gsap.timeline();
            const validCards = cardsRef.current.filter(el => el !== null);

            if (titleRef.current) {
                tl.from(titleRef.current, { y: -50, opacity: 0, duration: 1, ease: "power3.out" });
            }

            if (validCards.length > 0) {
                tl.from(validCards, {
                    y: 100, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out"
                }, "-=0.5");
            }
        }, containerRef);
        return () => ctx.revert();
    }, [isLoading]); // Removed filteredProducts to prevent jump on search

    return (
        <div ref={containerRef} className="relative w-full min-h-screen bg-black text-white font-mono overflow-x-hidden selection:bg-[#C1440E] selection:text-black">
            <Header theme="dark" />

            {/* 3D BACKGROUND LAYER */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 2, 10]} fov={50} />
                    <ArmoryScene />
                </Canvas>
            </div>

            {/* FOREGROUND CONTENT */}
            <div className="relative z-10 px-6 py-24 md:px-12 md:py-32 max-w-[1600px] mx-auto">

                {/* HEADER */}
                <header ref={titleRef} className="mb-12 text-center md:text-left border-b border-white/10 pb-8">
                    <h1 className="text-4xl md:text-6xl font-courier font-bold uppercase tracking-widest mb-4">
                        Armory
                    </h1>
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-xs md:text-sm tracking-widest text-[#C1440E]/80 mb-8">
                        <span>[ CLASSIFIED INVENTORY ]</span>
                        <span>SECURE CONNECTION ESTABLISHED</span>
                    </div>

                    {/* --- COMMAND BAR (Sticky) --- */}
                    <div className="w-full bg-black/80 backdrop-blur-md border border-white/20 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center sticky top-24 z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)]">

                        {/* Search */}
                        <div className="flex items-center gap-2 w-full lg:w-1/3 border-b border-[#C1440E]/50 pb-2 lg:pb-0 lg:border-b-0 lg:border-r pr-4">
                            <span className="text-[#C1440E] animate-pulse">🔎</span>
                            <input
                                type="text"
                                placeholder="SEARCH MANIFEST..."
                                className="bg-transparent border-none outline-none text-xs tracking-widest text-white w-full font-bold placeholder:text-white/30 uppercase"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4 w-full lg:w-2/3 justify-end items-center text-[10px] tracking-widest font-bold">

                            <div className="flex items-center gap-2">
                                <span className="text-white/50">FILTER:</span>
                                {["ALL", "TOPS", "BOTTOMS"].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategory(cat)}
                                        className={`px-3 py-1 border transition-all ${category === cat ? "border-[#C1440E] bg-[#C1440E] text-black" : "border-white/20 hover:border-white text-white"}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="w-[1px] h-6 bg-white/20 mx-2" />

                            <div className="flex items-center gap-2">
                                <span className="text-white/50">SORT:</span>
                                <select
                                    value={sortMode}
                                    onChange={(e) => setSortMode(e.target.value)}
                                    className="bg-black border border-white/20 px-2 py-1 outline-none text-white cursor-pointer hover:border-[#C1440E]"
                                >
                                    <option value="LATEST">LATEST ARRIVALS</option>
                                    <option value="LOW_HIGH">PRICE: LOW - HIGH</option>
                                    <option value="HIGH_LOW">PRICE: HIGH - LOW</option>
                                </select>
                            </div>

                        </div>
                    </div>
                </header>

                {/* PRODUCT GRID */}
                {isLoading ? (
                    <div className="w-full flex justify-center py-20 text-[#C1440E] animate-pulse font-mono tracking-widest">
                        :: ACCESSING SECURE DATABANKS... ::
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="w-full flex justify-center py-20 text-white/50 font-mono tracking-widest">
                        :: NO ASSETS FOUND MATCHING QUERY ::
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {filteredProducts.map((product, index) => (
                            <TransitionLink
                                href={`/product/${product.id}`}
                                key={product.id}
                                onClick={() => playClick()}
                                onMouseEnter={() => playHover()}
                                className="group relative block"
                            >
                                <div
                                    ref={(el) => (cardsRef.current[index] = el)}
                                    className="relative bg-black/40 backdrop-blur-sm border border-white/10 hover:border-[#C1440E] transition-colors duration-300 h-full flex flex-col"
                                >
                                    {/* CARD HEADER */}
                                    <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                                        <span className="text-[10px] text-[#C1440E] uppercase tracking-widest">
                                            MK-{product.id.toString().padStart(3, '0')}
                                        </span>
                                        <div className="w-2 h-2 rounded-full bg-[#C1440E] animate-pulse" />
                                    </div>

                                    {/* IMAGE CONTAINER */}
                                    <div className="relative aspect-square w-full overflow-hidden p-8 bg-black/50">
                                        {/* Grid overlay omitted for cleaner code, add back if needed */}
                                        <div className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105">
                                            <Image
                                                src={getThumbnail(product)}
                                                alt={product.name}
                                                fill
                                                className="object-contain drop-shadow-[0_0_15px_rgba(193,68,14,0.3)] opacity-80 group-hover:opacity-100 transition-opacity"
                                            />
                                        </div>
                                    </div>

                                    {/* INFO & SPECS */}
                                    <div className="p-6 border-t border-white/10 flex-grow flex flex-col">
                                        <h2 className="text-sm font-bold uppercase tracking-widest text-white mb-2 group-hover:text-[#C1440E] transition-colors">
                                            {product.name}
                                        </h2>
                                        <p className="text-xs text-white/50 mb-4 line-clamp-2 min-h-[2.5em] flex-grow">
                                            {product.description}
                                        </p>

                                        {/* FOOTER ACTION */}
                                        <div className="flex items-center justify-between mt-auto">
                                            <span className="text-lg font-bold text-white">
                                                {product.price}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest bg-[#C1440E] text-black px-3 py-1 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                Inspect
                                            </span>
                                        </div>
                                    </div>

                                    {/* HOVER GLOW BORDER */}
                                    <div className="absolute inset-0 border border-[#C1440E] opacity-0 scale-95 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
                                </div>
                            </TransitionLink>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>

    );
}
