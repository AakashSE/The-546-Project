"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

export default function HolographicMars({ scale = 2.5 }) {
    const meshRef = useRef();
    const pointsRef = useRef();
    const ringRef = useRef();

    useFrame((state, delta) => {
        // Rotation Logic
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.1; // Slow constant rotation
        }
        if (pointsRef.current) {
            pointsRef.current.rotation.y -= delta * 0.05; // Counter-rotate points for depth
        }
        if (ringRef.current) {
            ringRef.current.rotation.z += delta * 0.2;
            ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
        }
    });

    const marsOrange = "#C1440E";

    return (
        <group scale={scale}>
            {/* 1. MAIN WIREFRAME SPHERE (The Body) */}
            <Sphere ref={meshRef} args={[1, 32, 32]}>
                <meshBasicMaterial
                    color={marsOrange}
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </Sphere>

            {/* 1.5. GEODESIC GRID (Latitude/Longitude) */}
            <Sphere args={[0.99, 16, 16]}>
                <meshBasicMaterial
                    color={marsOrange}
                    wireframe
                    transparent
                    opacity={0.05} // Subtle underlying grid
                />
            </Sphere>

            {/* 3. GLOWING CORE (Solid inner for masking background) */}
            <Sphere args={[0.95, 32, 32]}>
                <meshBasicMaterial color="#000" />
            </Sphere>

            {/* 4. ORBITAL RINGS (Scanning effect) - COMPLEX */}
            <group ref={ringRef}>
                {/* Equatorial Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.6, 0.01, 64, 100]} />
                    <meshBasicMaterial color="#fff" transparent opacity={0.1} />
                </mesh>
                {/* Polar Ring */}
                <mesh rotation={[0, 0, 0]}>
                    <torusGeometry args={[1.4, 0.005, 64, 100]} />
                    <meshBasicMaterial color={marsOrange} transparent opacity={0.2} />
                </mesh>
                {/* Tilted Ring */}
                <mesh rotation={[Math.PI / 4, Math.PI / 4, 0]}>
                    <torusGeometry args={[1.8, 0.005, 64, 100]} />
                    <meshBasicMaterial color={marsOrange} transparent opacity={0.1} />
                </mesh>
            </group>

            {/* 5. SURFACE MARKERS (Bases) */}
            <group rotation={[0.5, 0.5, 0]}>
                <mesh position={[1, 0, 0]}>
                    <boxGeometry args={[0.05, 0.05, 0.05]} />
                    <meshBasicMaterial color="#fff" />
                </mesh>
                <mesh position={[-0.8, 0.5, 0.2]}>
                    <boxGeometry args={[0.05, 0.05, 0.05]} />
                    <meshBasicMaterial color="#fff" />
                </mesh>
            </group>

        </group>
    );
}
