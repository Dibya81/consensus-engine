'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { motion } from 'framer-motion';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-[100dvh] w-full bg-[#030305] text-zinc-100 flex overflow-hidden relative">

            {/* Glassmorphism 3.0: Animated Global Mesh Gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vh] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        x: [0, -100, 0],
                        y: [0, 100, 0],
                        opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vh] bg-violet-600/20 rounded-full blur-[150px] mix-blend-screen"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, 50, 0],
                        y: [0, 50, 0],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[30%] left-[30%] w-[40vw] h-[40vh] bg-emerald-600/10 rounded-full blur-[100px] mix-blend-screen"
                />
                <div className="absolute inset-0 bg-[#030305]/40 backdrop-blur-[50px] z-0 transform-gpu will-change-transform" />
            </div>

            {/* Mobile / Fallback TopBar */}
            <div className="absolute top-0 left-0 right-0 z-40 block lg:hidden pointer-events-none">
                <div className="pointer-events-auto">
                    <TopBar onMenuClick={() => setSidebarOpen(true)} />
                </div>
            </div>

            {/* Floating Spatial Nav / Command Pill (Sidebar) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-auto flex justify-center hidden lg:flex">
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {sidebarOpen && (
                <div className="absolute bottom-0 left-0 right-0 z-50 pointer-events-auto w-full lg:hidden block">
                    {/* mobile backdrop */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSidebarOpen(false)} />
                    <div className="fixed bottom-0 left-0 w-full rounded-t-3xl overflow-hidden pb-safe">
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-[100dvh] relative z-10 pt-16 lg:pt-0">
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 relative custom-scrollbar pb-32 lg:pb-32">
                    {children}
                </main>
            </div>
        </div>
    );
}
