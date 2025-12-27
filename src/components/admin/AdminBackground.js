"use client";
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';

function TacticalGrid() {
    const gridRef = useRef();

    useFrame((state, delta) => {
        if (gridRef.current) {
            // Slowly rotate or move the grid to feel alive
            gridRef.current.position.z = (state.clock.elapsedTime * 0.5) % 2;
        }
    });

    return (
        <group position={[0, -2, 0]}>
            <gridHelper
                ref={gridRef}
                args={[40, 40, 0xC1440E, 0x111111]}
                position={[0, 0, 0]}
            />
            {/* Secordary finer grid */}
            <gridHelper
                args={[40, 80, 0x333333, 0x050505]}
                position={[0, -0.01, 0]}
            />
        </group>
    );
}

function FloatingData() {
    const ref = useRef();
    const sphere = useMemo(() => random.inSphere(new Float32Array(500 * 3), { radius: 10 }), []);

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#C1440E"
                    size={0.02}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                />
            </Points>
        </group>
    );
}

export default function AdminBackground() {
    return (
        <div className="fixed inset-0 z-0 bg-[#020202]">
            {/* SCANLINE OVERLAY */}
            <div className="absolute inset-0 z-20 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
                    backgroundSize: '100% 2px, 3px 100%'
                }}
            />

            <Canvas camera={{ position: [0, 2, 5], fov: 60 }} gl={{ antialias: false }}>
                <color attach="background" args={['#020202']} />
                <fog attach="fog" args={['#020202', 2, 12]} />

                <TacticalGrid />
                <FloatingData />

                <ambientLight intensity={0.5} />
            </Canvas>
        </div>
    );
}
