'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Line, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles } from 'lucide-react';

const MOCK_NODES = [
    { pos: [0, 0, 0], label: "Core AI", temp: 0.95, size: 1.5 }, // Hot
    { pos: [2, 2, 0], label: "Distributed", temp: 0.6, size: 1 },
    { pos: [-2, 1, 1], label: "Algorithms", temp: 0.8, size: 1.2 }, // Hot
    { pos: [1, -2, -1], label: "Databases", temp: 0.2, size: 1 }, // Cold (Forgetting)
    { pos: [-1, -1, 2], label: "Frontend", temp: 0.98, size: 0.8 }, // Burning
    { pos: [3, 0, 1], label: "Microservices", temp: 0.4, size: 0.8 },
    { pos: [-3, -1, -1], label: "Graph Theory", temp: 0.1, size: 0.9 }, // Frozen
    { pos: [0, 3, -2], label: "Auth", temp: 0.7, size: 0.7 },
];

const MOCK_EDGES = [
    [0, 1], [0, 2], [0, 3], [0, 4], [1, 5], [2, 6], [3, 4], [1, 7], [0, 7]
];

function NebulaNode({ position, temp, size, label }: any) {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        if (ref.current) {
            // Hotter topics move faster and vibrate slightly (Neural RPG feel)
            const speed = 0.5 + temp * 2.5;
            const jitter = temp > 0.8 ? Math.sin(clock.elapsedTime * 20) * 0.02 : 0;
            ref.current.position.y = position[1] + Math.sin(clock.elapsedTime * speed + position[0]) * 0.15 + jitter;
            ref.current.rotation.y = clock.elapsedTime * speed * 0.5;
        }
    });

    // Interpolate color based on 3D Forgetting Curve temperature
    const color = useMemo(() => {
        const c1 = new THREE.Color('#334155'); // Cold Dark Slate (Forgotten)
        const c2 = new THREE.Color('#a855f7'); // Warm Purple (Learning)
        const c3 = new THREE.Color('#f97316'); // Hot Orange (Mastered)

        let finalColor = new THREE.Color();
        if (temp < 0.5) {
            finalColor.lerpColors(c1, c2, temp * 2);
        } else {
            finalColor.lerpColors(c2, c3, (temp - 0.5) * 2);
        }
        return finalColor;
    }, [temp]);

    const emissiveIntensity = 0.2 + temp * 6;
    const opacity = 0.4 + temp * 0.6;

    return (
        <group position={position} ref={ref}>
            <Sphere args={[size * 0.3, 32, 32]}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={emissiveIntensity} transparent opacity={opacity} />
            </Sphere>
            {/* Holographic Halo */}
            <Sphere args={[size * 0.6, 32, 32]}>
                <meshBasicMaterial color={color} transparent opacity={temp * 0.3} blending={THREE.AdditiveBlending} />
            </Sphere>
            <Text
                position={[0, -size * 0.8, 0]}
                fontSize={0.25}
                color={temp > 0.5 ? "white" : "#94a3b8"}
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
            >
                {label}
            </Text>
        </group>
    );
}

function ConstellationGroup({ isWarping }: { isWarping: boolean }) {
    const groupRef = useRef<THREE.Group>(null);
    const flowRef = useRef({ speed: 0.5, yTilt: 0, zPull: 0 });

    const lines = useMemo(() => {
        return MOCK_EDGES.map(edge => {
            const start = MOCK_NODES[edge[0]].pos;
            const end = MOCK_NODES[edge[1]].pos;
            // Line color is based on the target node's temperature
            const targetTemp = MOCK_NODES[edge[1]].temp;
            const c1 = new THREE.Color('#334155');
            const c2 = new THREE.Color('#a855f7');
            const c3 = new THREE.Color('#f97316');
            let color = new THREE.Color();
            if (targetTemp < 0.5) color.lerpColors(c1, c2, targetTemp * 2);
            else color.lerpColors(c2, c3, (targetTemp - 0.5) * 2);

            return {
                points: [new THREE.Vector3(...start), new THREE.Vector3(...end)],
                color
            };
        });
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        // Milestone Warp Gravitational Pull
        const targetSpeed = isWarping ? 3.0 : 0.5;
        const targetYTilt = isWarping ? 0.5 : 0;
        const targetZPull = isWarping ? -1.5 : 0;

        flowRef.current.speed += (targetSpeed - flowRef.current.speed) * delta * 2;
        flowRef.current.yTilt += (targetYTilt - flowRef.current.yTilt) * delta * 2;
        flowRef.current.zPull += (targetZPull - flowRef.current.zPull) * delta * 2;

        groupRef.current.rotation.y += delta * flowRef.current.speed;
        groupRef.current.rotation.x = -flowRef.current.yTilt;
        groupRef.current.position.z = flowRef.current.zPull;
    });

    return (
        <group ref={groupRef}>
            {MOCK_NODES.map((node, i) => (
                <NebulaNode key={i} position={node.pos} temp={node.temp} size={node.size} label={node.label} />
            ))}
            {lines.map((line, i) => (
                <Line key={i} points={line.points} color={line.color} opacity={isWarping ? 0.6 : 0.2} transparent lineWidth={isWarping ? 3 : 1.5} />
            ))}
        </group>
    );
}

export function KnowledgeNebula() {
    const [streakWarp, setStreakWarp] = useState(false);

    // Auto-trigger a milestone warp for demo purposes periodically
    useEffect(() => {
        const interval = setInterval(() => {
            setStreakWarp(true);
            setTimeout(() => setStreakWarp(false), 4000);
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-[400px] md:h-[500px] rounded-[2rem] overflow-hidden glass-card glow-border relative cursor-grab active:cursor-grabbing preserve-3d">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-orange-500/10 z-0 pointer-events-none mix-blend-screen transition-opacity duration-1000" style={{ opacity: streakWarp ? 1 : 0.4 }} />

            <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
                <color attach="background" args={['#050505']} />
                {/* Dynamically shift stars speed via warp state */}
                <Stars radius={50} depth={50} count={1000} factor={4} saturation={1} fade speed={streakWarp ? 6 : 1} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#a855f7" />

                <ConstellationGroup isWarping={streakWarp} />

                <OrbitControls enableZoom={false} autoRotate={!streakWarp} autoRotateSpeed={0.5} />
            </Canvas>

            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2 drop-shadow-md">
                    <span className={`w-2 h-2 rounded-full ${streakWarp ? 'bg-orange-500 shadow-[0_0_15px_#f97316]' : 'bg-primary shadow-[0_0_10px_#a855f7]'} transition-colors duration-1000 animate-[pulse_2s_cubic-bezier(0,0,0.2,1)_infinite]`} />
                    {streakWarp ? 'Milestone Warp Active' : 'Retention Nebula'}
                </h3>
                <p className={`text-[10px] md:text-sm font-mono tracking-widest mt-1 transition-colors duration-1000 ${streakWarp ? 'text-orange-400 opacity-100' : 'text-zinc-400 opacity-80'}`}>
                    {streakWarp ? 'GRAVITATIONAL PULL SHIFTING' : '3D FORGETTING CURVE'}
                </p>
            </div>

            <button
                onClick={() => setStreakWarp(!streakWarp)}
                className="absolute bottom-6 left-6 z-20 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold tracking-widest text-zinc-300 transition-colors flex items-center gap-2 backdrop-blur-md"
            >
                <Sparkles className={`w-3 h-3 ${streakWarp ? 'text-orange-400' : 'text-primary'}`} />
                TRIGGER STREAK
            </button>

            <div className="absolute bottom-6 right-6 z-20 pointer-events-none text-right">
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest opacity-60">DRAG TO ROTATE MATRIX</p>
            </div>
        </div>
    );
}
