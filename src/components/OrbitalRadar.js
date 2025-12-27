"use client";
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import HolographicMars from './HolographicMars';

export default function OrbitalRadar() {
    return (
        <div className="w-full h-full relative overflow-hidden bg-black group select-none">
            {/* 1. THE 3D SCENE */}
            <div className="absolute inset-0 z-10 transition-opacity duration-1000 opacity-60 hover:opacity-100">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 4.5]} />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        enableRotate={false} // NON-INTERACTIVE
                        autoRotate
                        autoRotateSpeed={1.5} // Slower, more elegant
                        minPolarAngle={Math.PI / 3}
                        maxPolarAngle={Math.PI / 1.5}
                    />
                    <ambientLight intensity={0.2} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#C1440E" />
                    <pointLight position={[-10, -5, -5]} intensity={0.5} color="#D2691E" /> {/* Rim Light */}

                    {/* The Mars Hologram */}
                    <HolographicMars scale={1.8} />
                </Canvas>
            </div>

            {/* 2. SCI-FI HUD OVERLAYS */}

            {/* Grid Background - Fine & Technical */}
            <div className="absolute inset-0 opacity-10 pointer-events-none z-0"
                style={{
                    backgroundImage: 'linear-gradient(to right, #C1440E 0.5px, transparent 0.5px), linear-gradient(to bottom, #C1440E 0.5px, transparent 0.5px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Central Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#C1440E]/20 rounded-full z-10 pointer-events-none flex items-center justify-center">
                <div className="w-1 h-1 bg-[#C1440E]/50 rounded-full" />
                <div className="absolute w-full h-[1px] bg-[#C1440E]/10" />
                <div className="absolute h-full w-[1px] bg-[#C1440E]/10" />
            </div>

            {/* Corner Markers - Technical */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-[#C1440E] opacity-60" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-[#C1440E] opacity-60" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b border-l border-[#C1440E] opacity-60" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-[#C1440E] opacity-60" />

            {/* Telemetry Data - Restored Detail */}
            <div className="absolute top-3 left-4 text-[6px] font-mono text-[#C1440E] tracking-widest leading-tight z-20 pointer-events-none">
                <div>SECTOR 7G // ALPHA</div>
                <div className="opacity-70">TARGET: HQ MAIN</div>
                <div className="opacity-50 mt-1">LAT: 18.44.92 N</div>
                <div className="opacity-50">LON: 77.21.03 E</div>
            </div>

            {/* Environment Data - Restored Detail */}
            <div className="absolute bottom-3 right-4 text-[6px] font-mono text-[#C1440E] text-right leading-tight z-20 pointer-events-none">
                <div>ELEV: -2500M</div>
                <div className="opacity-70">ATM: 95% STABLE</div>
                <div className="opacity-50 mt-1">TEMP: -63°C</div>
                <div className="opacity-50">WIND: 12KM/H NW</div>
            </div>

            {/* Live Indicator */}
            <div className="absolute top-3 right-4 flex items-center gap-2 z-20 pointer-events-none">
                <span className="text-[6px] font-mono text-[#C1440E] tracking-widest animate-pulse">REC ●</span>
            </div>
        </div>
    );
}
