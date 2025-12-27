"use client";
import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useAudio } from "../../context/AudioContext";
import useClickAudio from "../../hooks/useClickAudio";
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Archetypes, generateArchetypePoints } from './ArchetypeLibrary';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/client';
import Header from '../Header';
import OrbitalSentinel from './OrbitalSentinel';
import useMarsSound from "../../hooks/useMarsSound";

// --- SHADERS ---
const vertexShader = `
uniform float uTime;
uniform float uMorph;
uniform float uHover;
uniform float uScatter;
uniform vec2 uMouse;

attribute vec3 aRandom;

varying float vAlpha;
varying vec3 vColor;
varying float vTwinkle;

vec3 curlNoise(vec3 p) {
    return vec3(
        sin(p.y * 3.0 + uTime),
        cos(p.x * 3.0 + uTime),
        sin(p.z * 3.0 + uTime)
    ) * 0.5;
}

void main() {
    vec3 stormPos = aRandom;
    stormPos += curlNoise(stormPos + uTime * 0.5) * 2.0;

    vec3 forgePos = position; 
    float breeze = sin(forgePos.x * 2.0 + uTime * 1.5) * sin(forgePos.y * 1.0 + uTime * 2.0);
    forgePos.z += breeze * 0.2; 
    
    float mixFactor = smoothstep(0.0, 1.0, uMorph);
    vec3 finalPos = mix(stormPos, forgePos, mixFactor);

    // 4. EXCLUSIVE 3-SECOND IMMERSIVE TRANSIT
    if (uScatter > 0.0) {
        float t = uScatter; 
        
        // PHASE 1: Gravitational Charge (0.0 -> 0.45)
        // High-frequency vibration (Stress)
        float stress = smoothstep(0.0, 0.45, t) * (1.0 - smoothstep(0.45, 0.6, t));
        finalPos += curlNoise(finalPos * 3.0 + uTime * 20.0) * stress * 1.5;
        
        // SHOCKWAVE RIPPLE (0.3 -> 0.7)
        float wave = smoothstep(0.3, 0.7, t);
        float waveDist = length(finalPos.xy);
        float ripple = sin(waveDist * 0.5 - t * 40.0) * 0.5 * (1.0 - wave);
        finalPos.z += ripple;
        
        // PHASE 2: Core Implosion (0.4 -> 0.8)
        float implode = smoothstep(0.4, 0.8, t);
        finalPos *= (1.0 - implode * 0.98); 
        
        // PHASE 3: Slipstream Blast (0.75 -> 1.0)
        float blast = smoothstep(0.75, 1.0, t);
        finalPos.z += pow(blast, 3.0) * 220.0;
        finalPos.xy *= (1.0 + pow(blast, 4.0) * 30.0);
    }

    vec3 stormColor = vec3(0.8, 0.2, 0.05);
    vec3 forgeColor = vec3(1.0, 0.9, 0.8);
    vec3 transitColor = vec3(0.0, 0.8, 1.0); 

    vColor = mix(stormColor, forgeColor, mixFactor);
    
    // TRANSIT COLOR & CHROMATIC BURST
    float coreGlow = smoothstep(0.65, 0.8, uScatter) * (1.0 - smoothstep(0.8, 0.9, uScatter));
    vColor = mix(vColor, vec3(1.8, 1.9, 2.0), coreGlow); // Super-brilliant white
    
    // Chromatic Aberration Simulation (Shift color based on scatter peak)
    float chrom = smoothstep(0.8, 1.0, uScatter);
    vec3 chromColor = vec3(vColor.r + chrom * 0.5, vColor.g, vColor.b + chrom * 0.8);
    vColor = mix(vColor, chromColor, chrom);
    vColor = mix(vColor, transitColor, smoothstep(0.85, 1.0, uScatter));
    
    vColor += uHover * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // TRANSIT SIZE
    float blastSize = smoothstep(0.75, 1.0, uScatter) * 60.0;
    float rawSize = (55.0 / -mvPosition.z) * (1.0 - mixFactor * 0.5);
    gl_PointSize = clamp(rawSize + blastSize, 1.0, 120.0); 

    float depth = smoothstep(5.0, -5.0, finalPos.z);
    float twinkle = sin(uTime * 3.0 + aRandom.x * 10.0);
    vTwinkle = smoothstep(-1.0, 1.0, twinkle) * 0.7 + 0.3;
    
    vAlpha = (0.5 + depth * 0.5) * (1.0 - smoothstep(0.96, 1.0, uScatter));
}
`;

const fragmentShader = `
varying float vAlpha;
varying vec3 vColor;
varying float vTwinkle;

void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    float alpha = 1.0 - smoothstep(0.0, 0.5, dist); 
    gl_FragColor = vec4(vColor, alpha * vAlpha * vTwinkle * 0.9); 
}
`;

const COUNT = 30000;

function Simulation({ activeArchetype, scattering, setScattering, productMapping, setHovered, playClick }) {
    const pointsRef = useRef();
    const frozenRef = useRef(false);
    const router = useRouter();
    const { playSound: playConstellation } = useMarsSound("/assets/Constellation.mp3");

    const { randoms, targets } = useMemo(() => {
        const rnd = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            rnd[i * 3] = (Math.random() - 0.5) * 30;
            rnd[i * 3 + 1] = (Math.random() - 0.5) * 30;
            rnd[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }
        const tgt = generateArchetypePoints(activeArchetype, COUNT);
        return { randoms: rnd, targets: tgt };
    }, []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uHover: { value: 0 },
        uScatter: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) }
    }), []);

    useEffect(() => {
        frozenRef.current = false;
        if (!pointsRef.current) return;
        const newTargets = generateArchetypePoints(activeArchetype, COUNT);
        pointsRef.current.geometry.attributes.position.array.set(newTargets);
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }, [activeArchetype]);

    useFrame((state, delta) => {
        if (frozenRef.current) return;
        if (pointsRef.current) {
            const mat = pointsRef.current.material;
            mat.uniforms.uTime.value = state.clock.elapsedTime;
            mat.uniforms.uMorph.value = THREE.MathUtils.lerp(mat.uniforms.uMorph.value, 1.0, delta * 2);
            if (scattering) {
                // Takes roughly 3 seconds to reach 1.0 (delta * 0.33)
                mat.uniforms.uScatter.value += delta * 0.33;
            } else {
                mat.uniforms.uScatter.value = 0;
            }
        }
    });

    return (
        <>
            <points frustumCulled={false} ref={pointsRef} scale={[1.15, 1.15, 1.15]} rotation={[0, 0.2, 0]} position={[-0.5, 0.1, 0]}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={COUNT} array={targets} itemSize={3} />
                    <bufferAttribute attach="attributes-aRandom" count={COUNT} array={randoms} itemSize={3} />
                </bufferGeometry>
                <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
            </points>

            <mesh
                visible={false}
                scale={[4, 6, 2]}
                position={[-0.5, 0.1, 0]}
                onPointerOver={() => {
                    setHovered(true);
                    window.dispatchEvent(new CustomEvent("cursor-hover", { detail: true }));
                }}
                onPointerOut={() => {
                    setHovered(false);
                    window.dispatchEvent(new CustomEvent("cursor-hover", { detail: false }));
                }}
                onClick={async () => {
                    if (scattering) return;
                    playConstellation();
                    setScattering(true);

                    // 1. Wait for the 3-second cinematic peak (Blast starts at ~2.5s)
                    await new Promise(r => setTimeout(r, 2500));

                    // 2. Trigger Global Shutter (takes ~0.8s to close)
                    if (window.raiseCurtain) await window.raiseCurtain("next");

                    // 3. Complete Navigation (The shutter is now fully closed)
                    const targetId = productMapping?.[activeArchetype];
                    if (targetId) router.push(`/product/${targetId}`);
                }}
            >
                <boxGeometry />
                <meshBasicMaterial />
            </mesh>
        </>
    );
}

export default function ParticleScene() {
    const [archetype, setArchetype] = useState(Archetypes.POLO);
    const [scattering, setScattering] = useState(false);
    const [productMapping, setProductMapping] = useState({});
    const [hovered, setHovered] = useState(false);
    const { playClick } = useClickAudio();
    const router = useRouter();

    useEffect(() => {
        const fetchMapping = async () => {
            const { data } = await supabase.from('products').select('id, name, category');
            if (data) {
                const map = {};
                data.forEach(p => {
                    const n = p.name.toLowerCase();
                    if (n.includes('polo')) map[Archetypes.POLO] = p.id;
                    else if (n.includes('shirt') && !n.includes('tee')) map[Archetypes.SHIRT] = p.id;
                    else if (n.includes('formal') || n.includes('trouser')) map[Archetypes.FORMAL_PANT] = p.id;
                    else if (n.includes('tee') || n.includes('t-shirt')) map[Archetypes.CREW_TEE] = p.id;
                    else if (n.includes('track') || n.includes('jogger')) map[Archetypes.TRACK_PANT] = p.id;
                    else if (n.includes('short')) map[Archetypes.SHORTS] = p.id;
                });
                setProductMapping(map);
            }
        };
        fetchMapping();
    }, []);

    const labelMap = {
        'POLO': 'ORIGIN',
        'SHIRT': 'PROTOCOL',
        'FORMAL_PANT': 'STRUCTURE',
        'CREW_TEE': 'DRIFT',
        'TRACK_PANT': 'VELOCITY',
        'SHORTS': 'SURFACE'
    };

    const orderedKeys = ['POLO', 'SHIRT', 'FORMAL_PANT', 'CREW_TEE', 'TRACK_PANT', 'SHORTS'];

    return (
        <div className={`w-full h-screen bg-black relative overflow-hidden transition-all ${scattering ? 'animate-interference' : ''}`}>
            {/* INTERFERENCE OVERLAY (Flickers during build-up) */}
            {scattering && (
                <div className="absolute inset-0 z-[100] pointer-events-none bg-white/5 mix-blend-overlay animate-flicker-fast shadow-[inset_0_0_100px_rgba(0,180,255,0.1)]" />
            )}

            <div className={`absolute top-0 left-0 w-full z-50 transition-opacity duration-300 ${scattering ? 'opacity-40 brightness-150' : 'opacity-100'}`}>
                <Header theme="dark" />
            </div>

            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
                <color attach="background" args={['#050505']} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Sparkles count={500} scale={20} size={2} speed={0.4} opacity={0.5} color="#ff5500" />
                <Sparkles count={300} scale={15} size={3} speed={0.2} opacity={0.2} color="#ffffff" />
                <Simulation
                    activeArchetype={archetype}
                    scattering={scattering}
                    setScattering={setScattering}
                    productMapping={productMapping}
                    setHovered={setHovered}
                    playClick={playClick}
                />
            </Canvas>

            <div className={`absolute bottom-10 left-0 w-full flex flex-col items-center justify-center z-40 pointer-events-none transition-all duration-300 ${scattering ? 'scale-90 opacity-20 blur-sm' : 'opacity-100'}`}>
                <div className="relative w-96 h-8 overflow-hidden mb-4 mask-gradient-x">
                    <div className="absolute whitespace-nowrap animate-marquee flex gap-12 text-[#ff5500] font-mono text-[10px] tracking-[0.2em] items-center h-full">
                        <span>// SYSTEM_GUIDE :: CLICK CONSTELLATION TO EXPLORE :: USE BUTTONS BELOW TO NAVIGATE SECTORS</span>
                        <span>// SYSTEM_GUIDE :: CLICK CONSTELLATION TO EXPLORE :: USE BUTTONS BELOW TO NAVIGATE SECTORS</span>
                    </div>
                </div>
                <div className="flex gap-4 pointer-events-auto">
                    {orderedKeys.map((k) => (
                        <button
                            key={k}
                            onClick={() => { playClick(); setArchetype(Archetypes[k]); }}
                            className={`px-4 py-2 border border-[#333] text-xs font-bold tracking-widest transition-all ${Archetypes[k] === archetype ? 'bg-[#ff5500] text-black border-[#ff5500]' : 'text-[#666] hover:text-white hover:border-white'}`}
                        >
                            {labelMap[k]}
                        </button>
                    ))}
                </div>
            </div>

            <div className={`absolute bottom-32 left-16 pointer-events-none mix-blend-difference z-20 transition-all duration-500 ${scattering ? 'translate-x-[-100px] opacity-0 blur-xl' : 'opacity-60'}`}>
                {(() => {
                    const svgs = {
                        [Archetypes.POLO]: '/assets/Polo Tee/Polo.svg',
                        [Archetypes.CREW_TEE]: '/assets/Crew Tee/Crew.svg',
                        [Archetypes.FORMAL_PANT]: '/assets/Formal Pant/Formal Pant.svg',
                        [Archetypes.TRACK_PANT]: '/assets/Track Pant/Track Pant.svg',
                        [Archetypes.SHIRT]: '/assets/Shirt/Shirt.svg',
                        [Archetypes.SHORTS]: '/assets/Shorts/Shorts.svg'
                    };
                    return <img src={svgs[archetype]} alt={archetype} className="w-[160px] filter invert" />;
                })()}
            </div>

            <div className={`absolute top-1/2 right-12 -translate-y-1/2 flex flex-col items-end pointer-events-auto z-30 transition-all duration-300 ${scattering ? 'opacity-30 blur-[2px] skew-x-3' : 'opacity-80'}`}>
                <OrbitalSentinel />
            </div>

            <style jsx>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: marquee 10s linear infinite; }
                .mask-gradient-x { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
                
                @keyframes interference {
                    0% { transform: translate(0,0); filter: hue-rotate(0deg); }
                    10% { transform: translate(-2px, 1px); }
                    20% { transform: translate(2px, -1px); filter: hue-rotate(10deg); }
                    30% { transform: translate(-1px, 2px); }
                    40% { transform: translate(1px, -2px); }
                    50% { transform: translate(-2px, -1px); filter: hue-rotate(20deg); }
                    100% { transform: translate(0,0); }
                }
                .animate-interference {
                    animation: interference 0.2s infinite;
                }

                @keyframes flicker-fast {
                    0% { opacity: 0; }
                    5% { opacity: 0.15; }
                    10% { opacity: 0.05; }
                    15% { opacity: 0.2; }
                    20% { opacity: 0; }
                    100% { opacity: 0; }
                }
                .animate-flicker-fast {
                    animation: flicker-fast 0.5s infinite;
                }
            `}</style>
        </div>
    );
}
