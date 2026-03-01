'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, PresentationControls, Stars, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Search } from 'lucide-react';

const KNOWLEDGE_STARS = [
    { id: 'react', label: 'React Hooks', position: [-4, 2, -2], color: '#3b82f6' },
    { id: 'k8s', label: 'Kubernetes Architecture', position: [4, 3, -4], color: '#ec4899' },
    { id: 'sql', label: 'SQL Indexing', position: [-3, -2, 2], color: '#10b981' },
    { id: 'aws', label: 'AWS Serverless', position: [5, -1, 3], color: '#f59e0b' },
    { id: 'node', label: 'Node Streams', position: [0, 4, 1], color: '#a855f7' },
    { id: 'rust', label: 'Rust Ownership', position: [2, -4, -3], color: '#ef4444' },
    { id: 'graphql', label: 'GraphQL Resolvers', position: [-5, -3, -5], color: '#06b6d4' },
    { id: 'core', label: 'Neural Matrix Core', position: [0, 0, 0], color: '#10b981', isCore: true }
];

const KNOWLEDGE_EDGES = [
    [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6],
    [0, 6], [1, 3], [2, 4], [5, 1]
];

function KnowledgeStar({ label, position, color, isCore, searchQuery }: any) {
    const ref = useRef<THREE.Group>(null);
    const q = searchQuery.toLowerCase().trim();
    const hasQuery = q.length > 0;
    const isMatch = hasQuery && label.toLowerCase().includes(q);

    useFrame(({ clock }, delta) => {
        if (!ref.current) return;
        const targetScale = isMatch ? 2.5 : (hasQuery ? 0.3 : 1);
        ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);

        if (isCore) {
            ref.current.rotation.x += delta;
            ref.current.rotation.y += delta;
        } else {
            // Gentle idle hover
            ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.2;
        }
    });

    const opacity = isMatch ? 1 : (hasQuery ? 0.05 : 0.8);

    return (
        <group ref={ref} position={position} userData={{ label }}>
            <mesh>
                <icosahedronGeometry args={[isCore ? 1.5 : 0.8, isCore ? 2 : 0]} />
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isMatch ? 3 : 1.5} transparent opacity={opacity} wireframe={!isCore} />
            </mesh>
            <Text
                position={[0, isCore ? -2 : -1.2, 0]}
                fontSize={isMatch ? 0.4 : 0.3}
                color="white"
                anchorX="center"
                anchorY="middle"
                fillOpacity={opacity}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            >
                {label}
            </Text>
        </group>
    )
}

function VortexEdges({ searchQuery }: { searchQuery: string }) {
    const q = searchQuery.toLowerCase().trim();
    const hasQuery = q.length > 0;

    return (
        <group>
            {KNOWLEDGE_EDGES.map((edge, i) => {
                const s1 = KNOWLEDGE_STARS[edge[0]];
                const s2 = KNOWLEDGE_STARS[edge[1]];
                const isMatch1 = hasQuery && s1.label.toLowerCase().includes(q);
                const isMatch2 = hasQuery && s2.label.toLowerCase().includes(q);
                const isMatch = isMatch1 || isMatch2;

                const opacity = isMatch ? 0.6 : (hasQuery ? 0.02 : 0.2);

                return (
                    <Line
                        key={i}
                        points={[new THREE.Vector3(...s1.position), new THREE.Vector3(...s2.position)]}
                        color={isMatch ? '#a855f7' : s1.color}
                        opacity={opacity}
                        transparent
                        lineWidth={isMatch ? 3 : 1.5}
                    />
                );
            })}
        </group>
    );
}

function VortexController({ searchQuery }: { searchQuery: string }) {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const q = searchQuery.toLowerCase().trim();
        const hasQuery = q.length > 0;
        let targetCenter = new THREE.Vector3(0, 0, 0);
        let matchFound = false;

        if (hasQuery) {
            KNOWLEDGE_STARS.forEach((star) => {
                if (star.label.toLowerCase().includes(q)) {
                    targetCenter.fromArray(star.position);
                    matchFound = true;
                }
            });
        }

        // Camera POV warping: Pull close on match
        const baseZ = 12;
        const targetZ = matchFound ? 8 : baseZ;
        camera.position.lerp(new THREE.Vector3(0, 0, targetZ), delta * 5);

        // Group Manipulation
        if (matchFound) {
            // Warp center to pull matched node forward and to the center
            groupRef.current.position.lerp(new THREE.Vector3(-targetCenter.x * 0.8, -targetCenter.y * 0.8, 0), delta * 5);
            // Fast swirling vortex spin
            groupRef.current.rotation.y += delta * 2.0;
            groupRef.current.rotation.x += delta * 1.0;
        } else {
            // Return to neutral calm idle
            groupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), delta * 3);
            groupRef.current.rotation.y += delta * 0.2; // Slow idle
            groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * delta * 2;
        }
    });

    return (
        <group ref={groupRef}>
            {KNOWLEDGE_STARS.map((star, i) => (
                <KnowledgeStar key={i} {...star} searchQuery={searchQuery} />
            ))}
            <VortexEdges searchQuery={searchQuery} />
        </group>
    )
}

export function ThreeConsensusMap() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="w-full h-[500px] rounded-[2rem] overflow-hidden glass-card glow-border relative cursor-grab active:cursor-grabbing preserve-3d">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-emerald-500/10 z-0 pointer-events-none mix-blend-screen" />

            {/* The Vortex Search Input Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[80%] max-w-[400px]">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-primary transition-colors duration-300" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Vortex Semantic Search (e.g., React, SQL)..."
                        className="w-full bg-black/60 border border-white/10 rounded-full py-3 pl-12 pr-6 text-sm font-semibold tracking-wide text-zinc-200 focus:outline-none focus:border-primary/50 focus:ring-4 ring-primary/20 backdrop-blur-xl transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] placeholder:text-zinc-600"
                    />
                </div>
            </div>

            <Canvas camera={{ position: [0, 0, 12], fov: 45 }} dpr={[1, 1.5]}>
                <color attach="background" args={['#050505']} />
                {/* When searching, stars violently speed by imitating warp factor */}
                <Stars radius={50} depth={50} count={800} factor={4} saturation={0} fade speed={searchQuery.length > 0 ? 8 : 1} />
                <ambientLight intensity={0.2} />

                <pointLight position={[10, 10, 10]} intensity={2} color="#a855f7" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#3b82f6" />
                <pointLight position={[4, 0, 0]} intensity={3} color="#10b981" distance={10} />

                <PresentationControls
                    global
                    rotation={[0.1, 0, 0]}
                    polar={[-0.4, 0.4]}
                    azimuth={[-1, 1]}
                    config={{ mass: 2, tension: 400 }}
                    snap={{ mass: 4, tension: 400 }}
                >
                    <VortexController searchQuery={searchQuery} />
                </PresentationControls>
            </Canvas>

            <div className="absolute top-6 left-6 z-20 pointer-events-none hidden md:block">
                <h3 className="text-xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${searchQuery.length > 0 ? 'bg-primary shadow-[0_0_15px_#a855f7]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'} animate-[pulse_1s_cubic-bezier(0,0,0.2,1)_infinite] transition-colors`} />
                    Neural Syllabus
                </h3>
            </div>

            <div className="absolute bottom-6 right-6 z-20 pointer-events-none text-right">
                <p className={`text-[10px] md:text-xs font-mono tracking-widest transition-opacity duration-500 ${searchQuery.length > 0 ? 'text-primary opacity-100' : 'text-zinc-500 opacity-60'}`}>
                    {searchQuery.length > 0 ? 'VORTEX ENGAGED' : 'DRAG TO PAN GRAPH'}
                </p>
            </div>
        </div>
    );
}
