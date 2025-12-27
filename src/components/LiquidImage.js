"use client";
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useSpring, animated, config } from '@react-spring/three';

// --- THE FIX IS IN THIS SHADER CODE ---
const fragmentShader = `
uniform sampler2D uTexture;
uniform vec2 uOffset;
varying vec2 vUv;

// FIX: Renamed 'texture' to 'tex' to avoid "Reserved Keyword" error
vec3 rgbShift(sampler2D tex, vec2 uv, vec2 offset) {
  float r = texture2D(tex, uv + offset).r;
  vec2 gb = texture2D(tex, uv).gb;
  return vec3(r, gb);
}

void main() {
  vec2 uv = vUv;
  
  // Wave distortion math
  vec2 wave = uOffset * sin(uv.y * 20.0 + uOffset.x * 5.0);
  
  // Apply RGB Shift
  vec3 color = rgbShift(uTexture, uv + wave * 0.1, uOffset * 0.2);
  
  gl_FragColor = vec4(color, 1.0);
}
`;

const vertexShader = `
uniform vec2 uOffset;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 newPosition = position;
  
  // Bend the plane slightly on movement
  newPosition.x += sin(uv.y * 10.0 + uOffset.x) * uOffset.x * 0.5;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

function ImagePlane({ src }) {
    const mesh = useRef();

    // Load the texture safely
    const texture = useLoader(TextureLoader, src);

    // Physics-based animation hook
    const { mouse } = useSpring({
        mouse: [0, 0],
        config: config.molasses
    });

    const uniforms = useMemo(
        () => ({
            uTexture: { value: texture },
            uOffset: { value: new THREE.Vector2(0, 0) }
        }),
        [texture]
    );

    useFrame((state) => {
        // Only run if mesh exists
        if (!mesh.current) return;

        const { mouse: mousePos } = state;

        // Calculate ripple intensity based on mouse movement
        const targetX = (mousePos.x * 0.05);
        const targetY = (mousePos.y * 0.05);

        // Smoothly interpolate uniform values
        mesh.current.material.uniforms.uOffset.value.x += (targetX - mesh.current.material.uniforms.uOffset.value.x) * 0.1;
        mesh.current.material.uniforms.uOffset.value.y += (targetY - mesh.current.material.uniforms.uOffset.value.y) * 0.1;
    });

    return (
        // Adjust scale to match vertical portrait ratio (approx 3:4)
        <mesh ref={mesh} scale={[5, 6.5, 1]}>
            <planeGeometry args={[1, 1, 32, 32]} />
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
            />
        </mesh>
    );
}

export default function LiquidImage({ src }) {
    return (
        <div className="w-full h-full relative">
            <Canvas
                camera={{ position: [0, 0, 5] }}
                style={{ background: '#f4f4f4' }} // Match your site background so it blends
            >
                <ImagePlane src={src} />
            </Canvas>
        </div>
    );
}