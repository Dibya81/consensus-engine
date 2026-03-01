'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Terminal, Settings, LayoutDashboard, BrainCircuit, Code2, Users, Radio, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { HyperFocusBackground } from './hyper-focus-background';

interface SensoryContextType {
    playHoverDrop: () => void;
    playClickPop: () => void;
    playSystemAlert: () => void;
    typingSpeed: number; // 0 to 1 value representing typing velocity
    mouseParallax: { x: number, y: number }; // normalized -1 to 1 parallax constraints
}

const SensoryContext = createContext<SensoryContextType>({
    playHoverDrop: () => { },
    playClickPop: () => { },
    playSystemAlert: () => { },
    typingSpeed: 0,
    mouseParallax: { x: 0, y: 0 }
});

export const useSensory = () => useContext(SensoryContext);

export function SensoryProvider({ children }: { children: React.ReactNode }) {
    const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
    const [isHovering, setIsHovering] = useState(false);
    const [isKBarOpen, setIsKBarOpen] = useState(false);
    const audioCtx = useRef<AudioContext | null>(null);
    const router = useRouter();

    // Init Audio context on first interaction
    useEffect(() => {
        const initAudio = () => {
            if (!audioCtx.current) {
                audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        };
        window.addEventListener('click', initAudio, { once: true });
        return () => window.removeEventListener('click', initAudio);
    }, []);

    // Synthetic Sound Synthesis
    const playTone = (frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
        if (!audioCtx.current) return;
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, audioCtx.current.currentTime);
        // Envelope
        gain.gain.setValueAtTime(vol, audioCtx.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.start();
        osc.stop(audioCtx.current.currentTime + duration);
    };

    const playHoverDrop = () => playTone(800, 'sine', 0.1, 0.05);
    const playClickPop = () => playTone(1200, 'triangle', 0.15, 0.1);
    const playSystemAlert = () => playTone(250, 'sawtooth', 0.5, 0.15);

    // Typing Track Momentum
    const [typingSpeed, setTypingSpeed] = useState(0);
    const keyPresses = useRef<number[]>([]);

    useEffect(() => {
        const handleKeyDown = () => {
            const now = Date.now();
            keyPresses.current.push(now);
        };
        window.addEventListener('keydown', handleKeyDown);

        const interval = setInterval(() => {
            const now = Date.now();
            // Filter presses within last 2 seconds
            keyPresses.current = keyPresses.current.filter(t => now - t < 1500);
            // Calculate a normalized speed (0 to 1). Assume ~10 keys per 1.5s is "fast"
            const speed = Math.min(keyPresses.current.length / 10, 1);
            setTypingSpeed(prev => {
                // Smooth interpolation
                return prev + (speed - prev) * 0.1;
            });
        }, 100);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearInterval(interval);
        };
    }, []);

    // Magnetic Cursor & Parallax Track
    const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            setCursorPos({ x: e.clientX, y: e.clientY });

            // Calculate normalized screen coordinates (-1 to 1) for parallax
            const nx = (e.clientX / window.innerWidth) * 2 - 1;
            const ny = (e.clientY / window.innerHeight) * 2 - 1;
            setMouseParallax({ x: nx, y: ny });

            // Check if hovering clickable
            const target = e.target as HTMLElement;
            const isClickable = window.getComputedStyle(target).cursor === 'pointer' || target.tagName.toLowerCase() === 'button' || target.tagName.toLowerCase() === 'a';
            setIsHovering(isClickable);
        };

        // Hide default cursor on body
        document.body.style.cursor = 'none';

        window.addEventListener('mousemove', moveCursor);
        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.body.style.cursor = 'auto';
        };
    }, []);

    // Custom Button Audio Binders
    useEffect(() => {
        const handleDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a')) {
                playClickPop();
            }
        };
        const handleOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('button') || target.closest('a')) {
                // Throttle hover sounds to avoid spam
                if (Math.random() > 0.5) playHoverDrop();
            }
        };

        document.addEventListener('mousedown', handleDown);
        document.addEventListener('mouseover', handleOver);
        return () => {
            document.removeEventListener('mousedown', handleDown);
            document.removeEventListener('mouseover', handleOver);
        };
    }, []);

    // K-Bar Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsKBarOpen(prev => !prev);
                playSystemAlert();
            }
            if (e.key === 'Escape' && isKBarOpen) {
                setIsKBarOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isKBarOpen]);

    const navigateTo = (path: string) => {
        setIsKBarOpen(false);
        router.push(path);
    };

    const commands = [
        { id: 'dash', title: 'Intelligence Overview', icon: <LayoutDashboard className="w-4 h-4" />, path: '/dashboard' },
        { id: 'mentor', title: 'Neural Matrix Sync', icon: <BrainCircuit className="w-4 h-4" />, path: '/mentor' },
        { id: 'code', title: 'Holographic IDE', icon: <Code2 className="w-4 h-4" />, path: '/code' },
        { id: 'progress', title: 'Knowledge Nebula', icon: <Sparkles className="w-4 h-4" />, path: '/progress' },
        { id: 'community', title: 'Consensus Network', icon: <Users className="w-4 h-4" />, path: '/community' },
        { id: 'share', title: 'Proximity Share', icon: <Radio className="w-4 h-4" />, path: '/share' },
        { id: 'settings', title: 'System Config', icon: <Settings className="w-4 h-4" />, path: '/settings' },
    ];

    return (
        <SensoryContext.Provider value={{ playHoverDrop, playClickPop, playSystemAlert, typingSpeed, mouseParallax }}>
            {children}

            <HyperFocusBackground />

            {/* Magnetic Cursor */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary/50 pointer-events-none z-[9999] mix-blend-screen flex items-center justify-center transition-transform duration-100 ease-out"
                animate={{
                    x: cursorPos.x - 16,
                    y: cursorPos.y - 16,
                    scale: isHovering ? 1.5 : 1,
                    borderColor: isHovering ? 'rgba(168, 85, 247, 0.8)' : 'rgba(168, 85, 247, 0.3)',
                    backgroundColor: isHovering ? 'rgba(168, 85, 247, 0.1)' : 'transparent'
                }}
            >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/80" />
            </motion.div>

            {/* K-Bar Command Palette Overlay */}
            <AnimatePresence>
                {isKBarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xl flex items-start justify-center pt-[15vh]"
                        onClick={() => setIsKBarOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: -20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: -20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface/80 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.15)] w-full max-w-xl overflow-hidden preserve-3d"
                        >
                            <div className="p-4 border-b border-white/5 flex items-center gap-3">
                                <Terminal className="w-5 h-5 text-primary" />
                                <input
                                    autoFocus
                                    placeholder="Execute neural command... (ex. /go code)"
                                    className="bg-transparent border-none outline-none flex-1 text-zinc-100 placeholder-zinc-500 font-mono text-sm tracking-wide"
                                />
                                <div className="text-[10px] text-zinc-500 font-bold border border-white/10 px-1.5 py-0.5 rounded bg-black/30">ESC</div>
                            </div>
                            <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest p-3 pb-2 select-none">Global Network Systems</div>
                                <div className="grid gap-1">
                                    {commands.map((cmd) => (
                                        <button
                                            key={cmd.id}
                                            onClick={() => navigateTo(cmd.path)}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 text-zinc-300 hover:text-white transition-colors group text-left cursor-pointer"
                                        >
                                            <div className="p-2 rounded-lg bg-black/20 group-hover:bg-primary/20 group-hover:text-primary transition-colors border border-white/5 group-hover:border-primary/30">
                                                {cmd.icon}
                                            </div>
                                            <span className="font-medium text-sm">{cmd.title}</span>
                                            <span className="ml-auto opacity-0 group-hover:opacity-100 text-xs text-primary font-mono transition-opacity">↵ Enter</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SensoryContext.Provider>
    );
}
