"use client";
import React, { useState, useRef } from "react";
import { Canvas, useFrame, extend } from "@react-three/fiber";
import { PerspectiveCamera, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

// --- TRANSIT VELOCITY SHADER ---
const TransitMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color("#00FFFF"), // Cyan
        uFade: 100.0,
    },
    // Vertex
    `
    uniform float uTime;
    varying float vAlpha;
    void main() {
      vec3 pos = position;
      
      // LINEAR MOTION (Z-Axis infinite loop)
      // Range: -50 to +50
      float speed = 20.0;
      float zRange = 100.0;
      
      // Move Z forward based on time
      pos.z += uTime * speed;
      
      // Modulo to loop z within range
      pos.z = mod(pos.z, zRange) - (zRange * 0.5);
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Size attenuation
      gl_PointSize = (200.0 / -mvPosition.z);
      
      // Fade based on Z distance (fade in/out at edges of loop)
      // Normalized Z from -1 to 1
      float normZ = pos.z / (zRange * 0.5); 
      vAlpha = 1.0 - smoothstep(0.9, 1.0, abs(normZ)); // Sharper fade at very edge
    }
  `,
    // Fragment
    `
    uniform vec3 uColor;
    varying float vAlpha;

    void main() {
      // Soft circular particle
      float r = distance(gl_PointCoord, vec2(0.5));
      if (r > 0.5) discard;
      
      // Intense Glow center
      float glow = 1.0 - (r * 2.0);
      glow = pow(glow, 0.8); // Softer glow falloff = bigger bright spot

      // Boost Alpha
      gl_FragColor = vec4(uColor, vAlpha * glow * 2.0);
    }
  `
);
extend({ TransitMaterial });

function TransitField() {
    const points = useRef();
    const count = 4000;

    // Generate Random Points in a long tunnel
    const [positions] = useState(() => {
        const pos = new Float32Array(count * 3);
        const radius = 60; // Wide tunnel
        const length = 100;

        for (let i = 0; i < count; i++) {
            // Random mix of tunnel spread
            const r = (Math.random() ** 0.5) * radius * 1.5;
            const theta = Math.random() * Math.PI * 2;

            pos[i * 3] = r * Math.cos(theta); // X
            pos[i * 3 + 1] = r * Math.sin(theta); // Y
            pos[i * 3 + 2] = (Math.random() - 0.5) * length; // Z
        }
        return pos;
    });

    useFrame((state) => {
        if (points.current) {
            points.current.material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            {/* Blending Additive for "Light" feel */}
            <transitMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
}

function Scene({ isScanning, isLaunching, scanDirection }) {
    const camRef = useRef();

    // Warp Speed Effect
    useFrame((state) => {
        if (isLaunching && camRef.current) {
            // FOV Pull
            camRef.current.fov = THREE.MathUtils.lerp(camRef.current.fov, 120, 0.02);
            camRef.current.updateProjectionMatrix();
        }
    });

    return (
        <>
            <PerspectiveCamera ref={camRef} makeDefault position={[0, 0, 14]} fov={35} />
            <ambientLight intensity={0.5} />
            <color attach="background" args={['#020205']} />
            <TransitField />
        </>
    );
}

export default function TransitCanvas({ isScanning, isLaunching, scanDirection }) {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas>
                <Scene isScanning={isScanning} isLaunching={isLaunching} scanDirection={scanDirection} />
            </Canvas>
        </div>
    );
}
