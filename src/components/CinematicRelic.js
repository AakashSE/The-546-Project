"use client";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

export default function CinematicRelic({ order }) {
    const groupRef = useRef();
    const coreRef = useRef();
    const shard1Ref = useRef();
    const shard2Ref = useRef();
    const lightRef = useRef();

    // Generate inner "Data" particles for the crystal
    const particleData = useMemo(() => {
        const count = 50;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 1.5;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
        }
        return positions;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        // 1. Group Floating Physics
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(t * 0.5) * 0.3;
            groupRef.current.rotation.y = t * 0.1;
        }

        // 2. Core Pulse
        if (coreRef.current) {
            const pulse = 1.0 + Math.sin(t * 2) * 0.15;
            coreRef.current.scale.setScalar(pulse);
        }

        // 3. Shard Rotations (Complex Interweaving)
        if (shard1Ref.current) {
            shard1Ref.current.rotation.y = t * 0.3;
            shard1Ref.current.rotation.z = Math.sin(t * 0.5) * 0.2;
        }
        if (shard2Ref.current) {
            shard2Ref.current.rotation.y = -t * 0.2;
            shard2Ref.current.rotation.x = Math.cos(t * 0.4) * 0.3;
        }

        // 4. Dynamic Light Heartbeat
        if (lightRef.current) {
            lightRef.current.intensity = 15 + Math.sin(t * 4) * 5;
        }
    });

    return (
        <group ref={groupRef}>
            {/* --- LIGHT SOURCE (INTERNAL) --- */}
            <pointLight ref={lightRef} color="#FFB000" intensity={20} distance={10} />

            {/* --- THE SINGULARITY (THE CORE) --- */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    color="#FFB000"
                    emissive="#FFD700"
                    emissiveIntensity={12}
                    toneMapped={false}
                />
            </mesh>

            {/* --- OUTER REFRACTIVE SHARD 1 (MAIN SHELL) --- */}
            <mesh ref={shard1Ref}>
                <octahedronGeometry args={[2.2, 0]} />
                <MeshTransmissionMaterial
                    transmission={1}
                    thickness={1.5}
                    roughness={0.05}
                    ior={2.5}
                    chromaticAberration={0.15}
                    anisotropy={0.3}
                    distortion={0.2}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    color="#332211"
                    background={new THREE.Color("#020202")}
                />
            </mesh>

            {/* --- INNER SHARD 2 (SECONDARY SYNC) --- */}
            <mesh ref={shard2Ref} scale={1.2}>
                <octahedronGeometry args={[1, 0]} />
                <meshPhysicalMaterial
                    color="#FFD700"
                    metalness={1.0}
                    roughness={0.05}
                    emissive="#D4AF37"
                    emissiveIntensity={3}
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* --- INNER DATA PARTICLES --- */}
            <points>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleData.length / 3}
                        array={particleData}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color="#FFD700"
                    size={0.05}
                    sizeAttenuation
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* --- AURA RINGS (CINEMATIC TECH) --- */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[3.5, 0.01, 16, 128]} />
                <meshBasicMaterial color="#FFB000" transparent opacity={0.15} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 4]}>
                <torusGeometry args={[4.2, 0.005, 16, 128]} />
                <meshBasicMaterial color="#FFD700" transparent opacity={0.1} />
            </mesh>

        </group>
    );
}
