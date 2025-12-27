"use client";
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
    PerspectiveCamera,
    Float,
    Stars,
    OrbitControls,
    Instances,
    Instance
} from '@react-three/drei';

// --- SHADERS: HYPER-RESOLUTION MARS (8-Octave Simplex + Voronoi Craters) ---
const marsTerrainVertex = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDisplacement;
  varying vec3 vWorldPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) { 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  // Multi-Octave FBM (8 octaves for hyper-detail)
  float fbm(vec3 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 8; i++) { 
        v += a * snoise(p); 
        p *= 2.15; a *= 0.5; 
    }
    return v;
  }

  // Voronoi-based Crater Function
  float craters(vec3 p) {
    float d = length(p * 0.2);
    float n = snoise(p * 0.8);
    float c = smoothstep(0.4, 0.35, abs(n)) * 0.5;
    return c * (1.0 - smoothstep(0.0, 0.4, d));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Smooth Planetary Scaling
    float terrain = fbm(position * 0.12 + uTime * 0.01) * 0.8;
    float micro = fbm(position * 0.5) * 0.15;
    float craterPass = craters(position * 0.3) * 0.4;
    
    vDisplacement = terrain + micro + craterPass;
    
    // Very subtle displacement for planet (0.28 deviation for realistic scale)
    vec3 newPosition = position + normal * (vDisplacement * 0.28); 
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const marsTerrainFragment = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDisplacement;
  varying vec3 vWorldPosition;

  void main() {
    vec3 fdx = dFdx(vWorldPosition);
    vec3 fdy = dFdy(vWorldPosition);
    vec3 geometricNormal = normalize(cross(fdx, fdy));
    
    // Cinematic Planetary Palette
    vec3 basalt = vec3(0.05, 0.015, 0.01);
    vec3 oxide = vec3(0.65, 0.22, 0.06); 
    vec3 sunlight = vec3(1.0, 0.8, 0.55); 
    
    // Temperature Sifting (Darker Poles)
    float latFactor = abs(vUv.y - 0.5) * 2.0;
    vec3 poleTint = vec3(0.2, 0.15, 0.2);
    vec3 regionalColor = mix(oxide, basalt, smoothstep(0.4, 1.2, vDisplacement));
    vec3 baseColor = mix(regionalColor, poleTint, pow(latFactor, 4.0) * 0.4);
    
    // Direct Sunbeam 
    vec3 lightDir = normalize(vec3(8.0, 10.0, 12.0));
    float diff = max(dot(geometricNormal, lightDir), 0.0);
    float beam = pow(diff, 1.4);
    
    vec3 color = mix(baseColor, sunlight, smoothstep(0.8, 2.0, vDisplacement) * diff);
    color *= (beam * 3.8 + 0.03); 
    
    // Secondary Atmosphere (Rayleigh)
    float viewDot = max(0.0, dot(geometricNormal, normalize(vViewPosition)));
    float fresnel = pow(1.1 - viewDot, 12.0);
    vec3 atmColor = vec3(1.0, 0.2, 0.05); 
    color = mix(color, atmColor, fresnel * 0.9);
    
    // Sub-Surface Glow (Rim-definition)
    float rim = pow(1.0 - viewDot, 5.0);
    color += vec3(0.8, 0.3, 0.1) * rim * 0.3;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// --- COMPONENT: SATELLITE (True Depth POV Edition) ---
function GrandOdysseySatellite() {
    const groupRef = useRef();
    // BALANCED ANCHOR: Centered for a professional diagonal sweep
    const orbitAnchor = new THREE.Vector3(-4, 4, -30);
    const marsCenter = new THREE.Vector3(-32, 14, -90);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // MAJESTIC 90s PERIOD (2 * Math.PI / 90)
        const phase = t * 0.0698;

        if (groupRef.current) {
            // FLATTER DIAGONAL AMPLITUDES
            const xAmplitude = 24;
            const yAmplitude = 10;
            const zAmplitude = 55; // Range: -85 (far) to 25 (near)

            const x = Math.cos(phase) * xAmplitude + orbitAnchor.x;
            const y = Math.cos(phase) * yAmplitude + orbitAnchor.y;
            const z = Math.sin(phase) * zAmplitude + orbitAnchor.z;

            groupRef.current.position.set(x, y, z);
            groupRef.current.lookAt(marsCenter);
            groupRef.current.rotation.y += Math.PI;

            // TRUE DEPTH-BASED SCALING (Physically accurate zoom, no jumps)
            // Map Z [-85, 25] to Scale [0.15, 1.1] using smooth interpolation
            const minZ = orbitAnchor.z - zAmplitude;
            const maxZ = orbitAnchor.z + zAmplitude;
            const normZ = (z - minZ) / (maxZ - minZ); // 0 at back, 1 at front

            // Quadratic scaling for more dramatic cinematic perspective
            const dynamicScale = 0.15 + Math.pow(normZ, 2.2) * 0.95;
            groupRef.current.scale.setScalar(dynamicScale);

            groupRef.current.rotation.z += Math.sin(t * 0.2) * 0.03;
        }
    });

    return (
        <group ref={groupRef}>
            <pointLight intensity={550} distance={140} color="#ffffff" position={[10, 20, 25]} />
            <pointLight intensity={300} distance={120} color="#C1440E" position={[-10, -20, -25]} />

            {/* CORE CHASSIS (Chrome Mirror) */}
            <mesh>
                <cylinderGeometry args={[0.75, 0.85, 4.6, 16]} />
                <meshPhysicalMaterial color="#080808" metalness={1} roughness={0.01} envMapIntensity={12} clearcoat={1} />
            </mesh>

            {/* ENHANCED GREEBLING (Elite Hardware Detail) */}
            <Instances range={280}>
                <cylinderGeometry args={[0.01, 0.015, 1.8]} />
                <meshStandardMaterial color="#888" metalness={1} />
                {Array.from({ length: 140 }).map((_, i) => (
                    <Instance
                        key={i}
                        position={[(Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 4.8, (Math.random() - 0.5) * 2.2]}
                        rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
                        scale={Math.random() * 0.5 + 0.5}
                    />
                ))}
            </Instances>

            {/* SECONDARY SENSOR BEACONS */}
            <group position={[0, 2.3, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.1, 0.2, 0.6]} />
                    <meshStandardMaterial color="#333" />
                </mesh>
                {/* Pulsing indicator light */}
                <mesh position={[0, 0.35, 0]}>
                    <sphereGeometry args={[0.08, 8, 8]} />
                    <meshBasicMaterial color="#00ff00" />
                </mesh>
            </group>

            {/* ANTENNA ARRAYS (Hardware detailing) */}
            <group position={[0.8, -1.5, 0.8]} rotation={[0.4, 0, 0.4]}>
                <mesh>
                    <cylinderGeometry args={[0.02, 0.02, 2.5]} />
                    <meshStandardMaterial color="#666" />
                </mesh>
                <mesh position={[0, 1.25, 0]}>
                    <sphereGeometry args={[0.06]} />
                    <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={5} />
                </mesh>
            </group>

            <group position={[-0.8, 1.0, -0.8]} rotation={[-0.3, 0.5, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.01, 0.01, 3.2]} />
                    <meshStandardMaterial color="#777" />
                </mesh>
            </group>

            {/* VIVID SATURATED GOLD FOIL */}
            <mesh position={[0, 1.8, 0]}>
                <boxGeometry args={[2.3, 0.9, 2.3]} />
                <meshPhysicalMaterial
                    color="#FFD700"
                    metalness={1}
                    roughness={0.05}
                    emissive="#FFD700"
                    emissiveIntensity={0.25}
                    envMapIntensity={10}
                    clearcoat={1}
                />
            </mesh>
            <mesh position={[0, -1.8, 0]}>
                <boxGeometry args={[1.8, 0.6, 1.8]} />
                <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.05} envMapIntensity={8} />
            </mesh>

            <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.7]}>
                <mesh>
                    <sphereGeometry args={[1.4, 48, 48, 0, Math.PI * 2, 0, 0.5]} />
                    <meshPhysicalMaterial color="#ffffff" metalness={1} roughness={0.02} side={THREE.DoubleSide} envMapIntensity={10} />
                </mesh>
                <mesh position={[0, 1.2, 0]}>
                    <cylinderGeometry args={[0.04, 0.04, 1.8]} />
                    <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={8} />
                </mesh>
            </group>

            {/* EMISSIVE BLUE SOLAR WINGS (High Pop) */}
            <group position={[3.6, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.03, 10.5, 3.6]} />
                    <meshPhysicalMaterial
                        color="#004488"
                        metalness={1}
                        roughness={0.02}
                        emissive="#0044aa"
                        emissiveIntensity={1.2}
                        envMapIntensity={8}
                    />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.08]}>
                    <boxGeometry args={[0.05, 10.8, 3.8]} />
                    <meshStandardMaterial color="#444" wireframe />
                </mesh>
            </group>
            <group position={[-3.6, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <boxGeometry args={[0.03, 10.5, 3.6]} />
                    <meshPhysicalMaterial
                        color="#004488"
                        metalness={1}
                        roughness={0.02}
                        emissive="#0044aa"
                        emissiveIntensity={1.2}
                        envMapIntensity={8}
                    />
                </mesh>
                <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.08]}>
                    <boxGeometry args={[0.05, 10.8, 3.8]} />
                    <meshStandardMaterial color="#444" wireframe />
                </mesh>
            </group>
        </group>
    );
}

function GlobalMars() {
    const marsRef = useRef();
    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.getElapsedTime();
        // MARS REVERSAL: Left-to-Right rotation (Negative Y)
        if (marsRef.current) marsRef.current.rotation.y -= 0.0028;
    });

    return (
        <group position={[-32, 14, -90]}> {/* OFFSET FRAMING (X: -32, Y: 14, Z: -90) */}
            <mesh ref={marsRef}>
                <sphereGeometry args={[24.2, 256, 256]} /> {/* GOLIATH SIZE: 10% Increase */}
                <shaderMaterial
                    vertexShader={marsTerrainVertex}
                    fragmentShader={marsTerrainFragment}
                    uniforms={uniforms}
                    extensions={{ derivatives: true }}
                />
            </mesh>
        </group>
    );
}

function AsteroidField() {
    const count = 220;
    const meshRef = useRef();
    const instances = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            position: [(Math.random() - 0.5) * 350, (Math.random() - 0.5) * 250, (Math.random() - 0.5) * 180],
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            scale: Math.random() * 5 + 1.5,
        }));
    }, []);

    useFrame(() => {
        if (meshRef.current) meshRef.current.rotation.y += 0.0002;
    });

    return (
        <Instances range={count} ref={meshRef}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#080808" metalness={1} roughness={0.9} />
            {instances.map((data, i) => (
                <Instance key={i} position={data.position} rotation={data.rotation} scale={data.scale} />
            ))}
        </Instances>
    );
}

export default function HolographicWireframeBg() {
    return (
        <div className="fixed inset-0 z-0 bg-[#000001]">
            <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
                <PerspectiveCamera makeDefault position={[0, 0, 50]} fov={30} />
                <ambientLight intensity={0.12} />
                <directionalLight position={[40, 50, 40]} intensity={7.5} color="#ffd5b1" />

                <Stars radius={700} depth={200} count={35000} factor={16} saturation={0} fade={false} speed={0} />

                <GlobalMars />
                <GrandOdysseySatellite />
                <AsteroidField />

                <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />

                <Float speed={1.8} rotationIntensity={0} floatIntensity={14}>
                    <group>
                        {Array.from({ length: 240 }).map((_, i) => (
                            <mesh key={i} position={[(Math.random() - 0.5) * 300, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 180]}>
                                <sphereGeometry args={[0.07, 8, 8]} />
                                <meshBasicMaterial color="#C1440E" transparent opacity={0.14} />
                            </mesh>
                        ))}
                    </group>
                </Float>
            </Canvas>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-85 pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
