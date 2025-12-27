"use client";
import React, { useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float, PerspectiveCamera, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import Header from "../../../components/Header";
import useMarsSound from "../../../hooks/useMarsSound";
import { generateTicket } from "../../../utils/generateTicket";
import SciFiInvoice from "../../../components/SciFiInvoice";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from "../../../context/AuthContext";

// --- 3D SCENE: HYPERSPACE PARTICLES ---
function HyperspaceParticles() {
    const ref = useRef();
    const count = 4000;

    const { positions, velocities } = React.useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute in a cylinder/tunnel
            const r = Math.random() * 15 + 2;
            const theta = Math.random() * Math.PI * 2;

            positions[i * 3] = r * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(theta);
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // Long tunnel

            velocities[i] = Math.random() * 0.5 + 0.1;
        }
        return { positions, velocities };
    }, []);

    useFrame((state, delta) => {
        if (!ref.current) return;
        const attr = ref.current.geometry.attributes.position;

        for (let i = 0; i < count; i++) {
            // Move particles towards camera (positive Z)
            attr.array[i * 3 + 2] += velocities[i] * 40 * delta;

            // Loop back once they pass the camera
            if (attr.array[i * 3 + 2] > 20) {
                attr.array[i * 3 + 2] = -30;
            }
        }
        attr.needsUpdate = true;

        // Subtle global rotation
        ref.current.rotation.z += delta * 0.05;
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#FFD700"
                size={0.06}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.4}
            />
        </Points>
    );
}

import CinematicRelic from "../../../components/CinematicRelic";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";

function SuccessScene({ order }) {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={40} />
            <color attach="background" args={['#010101']} />

            {/* LIGHTING SETUP */}
            <ambientLight intensity={0.2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={50} color="#FFD700" />
            <pointLight position={[-10, -10, -10]} intensity={20} color="#C1440E" />

            {/* THE CLIMAX OBJECT */}
            <CinematicRelic order={order} />

            {/* TUNNEL EXPERIENCE */}
            <HyperspaceParticles />

            {/* POST PROCESSING */}
            <EffectComposer multisampling={0} disableNormalPass>
                <Bloom
                    luminanceThreshold={1}
                    mipmapBlur
                    intensity={1.5}
                    radius={0.4}
                />
                <ChromaticAberration offset={[0.0015, 0.0015]} />
                <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
        </>
    );
}

export default function SuccessPage() {
    const { user } = useAuth();
    const { playSound: playSuccess } = useMarsSound("/assets/Success.mp3");

    const [latestOrder, setLatestOrder] = React.useState(null);
    const [latestOrderItems, setLatestOrderItems] = React.useState([]);
    const [isDownloading, setIsDownloading] = React.useState(false);
    const containerRef = useRef(null);
    const invoiceRef = useRef(null);

    useEffect(() => {
        const fetchLatestOrder = async () => {
            const { supabase } = await import("../../../utils/supabase/client");

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1);

            if (orders && orders.length > 0) {
                setLatestOrder(orders[0]);
                const { data: items } = await supabase
                    .from('order_items')
                    .select('*')
                    .eq('order_id', orders[0].id);
                setLatestOrderItems(items || []);
            }
        };
        fetchLatestOrder();

        const ctx = gsap.context(() => {
            gsap.from(".reveal-text", {
                y: 80,
                opacity: 0,
                stagger: 0.2,
                duration: 2,
                ease: "power4.out",
                delay: 0.8
            });

            // Fade in UI with cinematic glow
            gsap.from(".hero-glow", {
                opacity: 0,
                scale: 0.8,
                duration: 2.5,
                ease: "expo.out",
                delay: 1.2
            });
        }, containerRef.current);
    }, []);

    const handleDownloadManifest = async () => {
        if (!latestOrder || !invoiceRef.current) return;
        setIsDownloading(true);

        try {
            // Give time for any lazy images
            await new Promise(r => setTimeout(r, 1000));

            const canvas = await html2canvas(invoiceRef.current, {
                backgroundColor: "#000000",
                scale: 4,
                useCORS: true,
                allowTaint: true,
                logging: false
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`MARS_MANIFEST_${latestOrder.id.slice(0, 8)}.pdf`);
        } catch (err) {
            console.error("Manifest Gen Failed", err);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-[#000000] text-white overflow-hidden font-mono">
            <Header theme="dark" />

            {/* 3D BACKGROUND (THE STAGE) */}
            <div className="absolute inset-0 z-0">
                <Canvas
                    gl={{
                        antialias: false,
                        stencil: false,
                        depth: true,
                        powerPreference: "high-performance"
                    }}
                >
                    <Suspense fallback={null}>
                        <SuccessScene order={latestOrder} />
                    </Suspense>
                </Canvas>
            </div>

            {/* CINEMATIC HUD OVERLAY (CENTERED) */}
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none px-8">
                {/* HEADLINE BOX */}
                <div className="hero-glow relative text-center mb-8">
                    <div className="absolute inset-0 bg-amber-500/10 blur-[120px] rounded-full scale-150" />
                    <h1 className="reveal-text text-5xl md:text-7xl lg:text-8xl font-luxury uppercase tracking-tighter mb-4 text-white leading-[0.9]">
                        TRANSMISSION COMPLETE
                    </h1>
                    <div className="reveal-text flex items-center justify-center gap-6 opacity-30 scale-75 md:scale-100">
                        <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-white" />
                        <span className="text-[10px] uppercase tracking-[0.8em] font-light whitespace-nowrap">Asset Secure // Sector 4 Locked</span>
                        <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-white" />
                    </div>
                </div>

                {/* ACTIONS (Center Bottom of cluster) */}
                <div className="reveal-text flex flex-col md:flex-row gap-6 mt-16 md:mt-32 pointer-events-auto">
                    <button
                        onClick={handleDownloadManifest}
                        disabled={!latestOrder || isDownloading}
                        className="group relative px-12 py-5 bg-black/40 backdrop-blur-md border border-white/10 overflow-hidden transition-all hover:border-amber-400/50 clip-path-slant"
                    >
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 group-hover:text-amber-400 transition-colors">
                            {isDownloading ? "Capturing..." : "Download Manifest"}
                        </span>
                    </button>

                    <Link
                        href="/"
                        className="group relative px-12 py-5 bg-white overflow-hidden transition-all hover:scale-105 clip-path-slant"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black group-hover:tracking-[0.6em] transition-all">
                            Return to Base
                        </span>
                    </Link>
                </div>
            </div>

            {/* DATA FEED (Bottom Right - HUD STYLE) */}
            <div className="absolute bottom-12 right-12 z-50 pointer-events-none text-right">
                <div className="reveal-text space-y-1">
                    <div className="flex items-center justify-end gap-2 mb-4">
                        <span className="text-[9px] uppercase tracking-[0.3em] text-amber-500">Identity: {user?.user_metadata?.username || "TESTER"}</span>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    </div>
                    <p className="text-[8px] opacity-30 tracking-widest uppercase font-mono">ID: {latestOrder?.id.slice(0, 16) || "SYNCHRONIZING..."}</p>
                    <p className="text-[8px] opacity-30 tracking-widest uppercase font-mono">COORD: SECTOR_4_COORD_BETA</p>
                    <p className="text-[8px] opacity-30 tracking-widest uppercase font-mono">SIG: ENCRYPTED_ARES</p>
                </div>
            </div>

            {/* SIDEBAR DECO (Right) */}
            <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20 hidden xl:flex flex-col gap-24 items-center opacity-10 pointer-events-none">
                <div className="h-64 w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
                <div className="rotate-90 text-[8px] uppercase tracking-[1em] whitespace-nowrap">EXTRACTING_DATA_LOG</div>
                <div className="h-64 w-[1px] bg-gradient-to-b from-transparent via-white to-transparent" />
            </div>

            {/* HIDDEN INVOICE RENDERER */}
            <div className="absolute left-[-9999px] top-0 pointer-events-none">
                {latestOrder && (
                    <SciFiInvoice
                        ref={invoiceRef}
                        order={{ ...latestOrder, order_items: latestOrderItems }}
                        user={user}
                    />
                )}
            </div>

            <style jsx>{`
                .clip-path-slant {
                    clip-path: polygon(10% 0, 100% 0, 90% 100%, 0% 100%);
                }
            `}</style>
        </div>
    );
}
