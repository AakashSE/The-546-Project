"use client";
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cylinder, Cone } from "@react-three/drei";
import * as THREE from "three";

export default function Radar() {
    const groupRef = useRef();
    const beamRef = useRef();

    useFrame((state, delta) => {
        // Rotate the entire radar assembly slowly
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.2;

            // Add a slight wobble for realism
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        }
    });

    const marsOrange = "#C1440E";

    return (
        <group ref={groupRef} position={[0, -1, 0]} rotation={[0.2, 0, 0]}>
            {/* BASE STAND */}
            <Cylinder args={[0.2, 0.5, 2, 8]} position={[0, -1, 0]}>
                <meshBasicMaterial color="#333" wireframe />
            </Cylinder>

            {/* DISH (Cone pointing up/out) */}
            <group position={[0, 0.5, 0]} rotation={[0.5, 0, 0]}>
                {/* Main Dish Structure */}
                <Cone args={[2, 1, 16, 2, true]} rotation={[Math.PI, 0, 0]} position={[0, 0, 0]}>
                    <meshBasicMaterial color={marsOrange} wireframe transparent opacity={0.3} side={THREE.DoubleSide} />
                </Cone>

                {/* Inner Ring for detail */}
                <Cone args={[1, 0.5, 16, 1, true]} rotation={[Math.PI, 0, 0]} position={[0, 0.1, 0]}>
                    <meshBasicMaterial color="white" wireframe transparent opacity={0.1} side={THREE.DoubleSide} />
                </Cone>

                {/* RECEIVER / EMITTER CENTER */}
                <Cylinder args={[0.05, 0.05, 1.5]} position={[0, 0.5, 0]}>
                    <meshBasicMaterial color="white" />
                </Cylinder>

                {/* SCANNING BEAM */}
                {/* A semi-transparent cone that extends outwards to simulate a signal beam */}
                <Cone
                    ref={beamRef}
                    args={[0.5, 4, 32, 1, true]}
                    position={[0, 2, 0]}
                    rotation={[0, 0, 0]} // Points straight up from the dish center
                >
                    <meshBasicMaterial
                        color={marsOrange}
                        transparent
                        opacity={0.15}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </Cone>
            </group>
        </group>
    );
}
