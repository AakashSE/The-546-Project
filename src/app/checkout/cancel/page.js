"use client";
import React, { useEffect, useRef, Suspense, useMemo } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Effects, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { FilmPass, WaterPass, UnrealBloomPass } from "three-stdlib";
import Header from "../../../components/Header";
import useMarsSound from "../../../hooks/useMarsSound";
import TransitionLink from "../../../components/TransitionLink";
import { useTransition } from "../../../context/TransitionContext";
import { useSearchParams } from "next/navigation";



// --- 3D SCENE: THE VOID (Distorted Noise) ---
function GlitchMesh() {
    const mesh = useRef();
    const light = useRef();

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (mesh.current) {
            // Glitch movement
            mesh.current.rotation.x = Math.sin(time * 0.5) * 0.2;
            mesh.current.rotation.y = Math.cos(time * 0.3) * 0.2;
            mesh.current.position.y = Math.sin(time) * 0.1;
            // Pulse scale
            const s = 1 + Math.sin(time * 10) * 0.05;
            mesh.current.scale.set(s, s, s);
        }
        if (light.current) {
            light.current.intensity = 2 + Math.random() * 5; // Flicker
        }
    });

    return (
        <group>
            <pointLight ref={light} position={[2, 3, 4]} color="#FF0000" distance={10} />
            <mesh ref={mesh} position={[0, 0, 0]}>
                <icosahedronGeometry args={[1.8, 10]} />
                <meshStandardMaterial
                    color="#000000"
                    emissive="#FF0000"
                    emissiveIntensity={0.5}
                    wireframe={true}
                    wireframeLinewidth={2}
                />
            </mesh>
            {/* Inner Core */}
            <mesh scale={[0.5, 0.5, 0.5]}>
                <dodecahedronGeometry args={[2, 0]} />
                <meshBasicMaterial color="black" />
            </mesh>
        </group>
    );
}

function Scene() {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 7]} />
            <color attach="background" args={['#050000']} />
            <GlitchMesh />
            <gridHelper args={[20, 20, 0x330000, 0x110000]} position={[0, -3, 0]} />
        </>
    );
}

function CancelPageContent() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason') || "SIGNAL INTERRUPTED BY USER";
    const { playSound: playError } = useMarsSound("/assets/Error.mp3");

    const { playSound: playSwitch } = useMarsSound("/assets/ColourClick.mp3");
    const { navigateWithTransition } = useTransition();

    return (
        <div className="relative w-full h-screen bg-black text-red-600 font-mono overflow-hidden">
            <Header theme="dark" />

            {/* ERROR NOISE OVERLAY */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 z-20 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)50%,rgba(0,0,0,0.25)50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            {/* SPLIT LAYOUT */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

                {/* RIGHT: 3D GLITCH OBJECT (Now on Right for Asymmetry) */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full order-1 md:order-2 relative border-b md:border-b-0">
                    <Canvas>
                        <Scene />
                    </Canvas>
                    {/* "NO SIGNAL" BOX */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-red-600 bg-black/80 px-4 py-2 text-xs font-bold tracking-widest animate-pulse">
                        NO CARRIER
                    </div>
                </div>

                {/* LEFT: TERMINAL UI */}
                <div className="w-full md:w-1/2 h-1/2 md:h-full order-2 md:order-1 flex flex-col justify-center p-8 md:p-24 bg-black/90">
                    <div className="space-y-6 max-w-xl">
                        {/* Header */}
                        <div className="border-l-4 border-red-600 pl-6">
                            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white mb-2 glitch-text" data-text="ERROR">
                                ERROR
                            </h1>
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.2em] text-red-600">
                                402: Payment Required
                            </h2>
                        </div>

                        {/* Console Log */}
                        <div className="font-mono text-xs md:text-sm text-red-500/70 space-y-2 p-6 bg-red-900/10 border border-red-900/30">
                            <p>&gt; Initiating transfer protocol...</p>
                            <p>&gt; Handshake request sent.</p>
                            <p>&gt; <span className="text-white">Warning:</span> {reason.toUpperCase()}</p>
                            <p>&gt; Packet loss: 100%</p>
                            <p className="animate-pulse">&gt; System waiting for retry command_</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-6 pt-6 pointer-events-auto">
                            <button
                                onClick={() => navigateWithTransition('/checkout', playSwitch, "next")}
                                className="flex-1 px-8 py-4 bg-red-600 text-black font-bold uppercase tracking-widest hover:bg-white hover:text-red-600 transition-colors text-center shadow-[0_0_20px_rgba(255,0,0,0.5)] cursor-pointer"
                            >
                                Re-Initialize
                            </button>
                            <button
                                onClick={() => navigateWithTransition('/', playSwitch, "next")}
                                className="flex-1 px-8 py-4 border border-red-600/30 text-red-600 font-bold uppercase tracking-widest hover:bg-red-600/10 transition-colors text-center cursor-pointer"
                            >
                                Abort
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx>{`
                .glitch-text {
                    position: relative;
                }
                .glitch-text::before,
                .glitch-text::after {
                    content: attr(data-text);
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                }
                .glitch-text::before {
                    left: 2px;
                    text-shadow: -1px 0 red;
                    clip: rect(24px, 550px, 90px, 0);
                    animation: glitch-anim-2 3s infinite linear alternate-reverse;
                }
                .glitch-text::after {
                    left: -2px;
                    text-shadow: -1px 0 blue;
                    clip: rect(85px, 550px, 140px, 0);
                    animation: glitch-anim 2.5s infinite linear alternate-reverse;
                }
                @keyframes glitch-anim {
                    0% { clip: rect(12px, 9999px, 86px, 0); }
                    100% { clip: rect(41px, 9999px, 128px, 0); }
                }
                @keyframes glitch-anim-2 {
                    0% { clip: rect(69px, 9999px, 46px, 0); }
                    100% { clip: rect(144px, 9999px, 12px, 0); }
                }
            `}</style>
        </div>
    );
}

export default function CancelPage() {
    return (
        <Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center font-mono text-red-600">RE-SYNCHRONIZING...</div>}>
            <CancelPageContent />
        </Suspense>
    );
}
