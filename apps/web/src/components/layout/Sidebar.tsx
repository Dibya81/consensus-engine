'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, BookOpen, Code, Users,
    LayoutDashboard, Mic, Briefcase, Share2,
    Settings, LogOut, BarChart3, ChevronUp, User, Navigation
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar({ onClose }: { onClose?: () => void }) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const [isHovered, setIsHovered] = useState(false);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Mentor', path: '/mentor', icon: MessageSquare },
        { name: 'Notes', path: '/notes', icon: BookOpen },
        { name: 'Code Hub', path: '/code', icon: Code },
        { name: 'Orbit', path: '/progress', icon: BarChart3 },
        { name: 'Network', path: '/community', icon: Users },
        { name: 'Share', path: '/share', icon: Share2 }
    ];

    return (
        <motion.div
            className="flex flex-col items-center justify-end z-[100]"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <motion.div
                layout
                className={`bg-zinc-950/80 backdrop-blur-[40px] border border-white/10 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center relative overflow-visible preserve-3d transition-all duration-500 ${isHovered ? 'p-2' : 'p-1'}`}
                style={{ WebkitBackdropFilter: "blur(40px)" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none rounded-full" />

                <AnimatePresence mode="wait">
                    {!isHovered ? (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-[1px] shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
                        >
                            <div className="w-full h-full bg-zinc-950/50 backdrop-blur-md rounded-full flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-blue-500/30 swirl-animation" />
                                <Navigation className="w-5 h-5 text-white animate-pulse relative z-10" />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="nav"
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            className="flex items-center gap-2 px-3 overflow-hidden"
                        >
                            {navItems.map((item) => {
                                const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
                                return (
                                    <Link key={item.path} href={item.path} onClick={onClose} className="relative group/btn z-50">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary/20 text-primary-light shadow-[inset_0_1px_rgba(255,255,255,0.2)] scale-110 border border-primary/30' : 'hover:bg-white/10 text-zinc-400 hover:text-zinc-100 hover:scale-105'}`}>
                                            <item.icon className="w-[22px] h-[22px] transition-transform duration-300" strokeWidth={isActive ? 2.5 : 1.5} />
                                        </div>
                                        {/* Tooltip */}
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900 border border-white/10 text-zinc-200 text-xs font-bold rounded-lg opacity-0 -translate-y-2 group-hover/btn:opacity-100 group-hover/btn:translate-y-0 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl flex items-center gap-2">
                                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                            {item.name}
                                        </div>
                                    </Link>
                                );
                            })}

                            <div className="w-px h-8 bg-white/10 mx-2" />

                            <button onClick={logout} className="relative group/logout w-12 h-12 rounded-full flex items-center justify-center hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-all">
                                <LogOut className="w-[22px] h-[22px]" strokeWidth={1.5} />
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-zinc-900 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-lg opacity-0 -translate-y-2 group-hover/logout:opacity-100 group-hover/logout:translate-y-0 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl">
                                    Disengage
                                </div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
