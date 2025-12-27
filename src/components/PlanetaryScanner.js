"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function PlanetaryScanner({ isScanning = false, scanDirection = 1 }) {
    const group = useRef();
    const innerGlobe = useRef();
    const outerRing = useRef();

    useFrame((state) => {
        if (group.current) {
            // Base Rotation
            if (isScanning) {
                innerGlobe.current.rotation.y += 0.05 * scanDirection; // Spin Direction
                outerRing.current.rotation.z -= 0.02 * scanDirection;
            } else {
                innerGlobe.current.rotation.y += 0.002; // Idle
                outerRing.current.rotation.z -= 0.001;
            }

            // Float
            group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });

    // Dynamic Color based on direction (Adding = Bright Red, Deleting = Crimson)
    const scanColor = scanDirection === 1 ? "#FF3333" : "#8B0000";

    return (
        <group ref={group} scale={[2, 2, 2]}>
            {/* 1. WIREFRAME GLOBE (MARS) */}
            <mesh ref={innerGlobe}>
                <icosahedronGeometry args={[1, 4]} /> {/* High detail for wireframe */}
                <meshBasicMaterial
                    color="#00FFFF" // Cyan/Ice
                    wireframe={true}
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* 2. INNER CORE (Solid Holo) */}
            <mesh>
                <sphereGeometry args={[0.9, 32, 32]} />
                <meshBasicMaterial color="#001133" transparent opacity={0.8} />
            </mesh>

            {/* 3. ORBITAL RING */}
            <mesh ref={outerRing} rotation={[1.5, 0, 0]}>
                <torusGeometry args={[1.6, 0.02, 16, 100]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.2} />
            </mesh>

            {/* 4. SCAN LINE (Effect) */}
            {isScanning && (
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <ringGeometry args={[1.1, 1.2, 64]} />
                    <meshBasicMaterial color={scanColor} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
            )}

        </group>
    );
}
