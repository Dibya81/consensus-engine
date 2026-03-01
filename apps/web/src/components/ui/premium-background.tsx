'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function PremiumBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0F172A] pointer-events-none">
            {/* The gradient blobs container with a high blur for the soft aura effect */}
            <div className="absolute inset-0 opacity-60">
                {/* Purple Blob */}
                <motion.div
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -80, 50, 0],
                        scale: [1, 1.2, 0.9, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[10%] left-[15%] w-[40vw] h-[40vw] bg-[#8B5CF6] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
                />

                {/* Cyan Blob */}
                <motion.div
                    animate={{
                        x: [0, -80, 40, 0],
                        y: [0, 60, -40, 0],
                        scale: [1, 0.9, 1.2, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[5%] right-[10%] w-[35vw] h-[35vw] bg-[#38BDF8] rounded-full mix-blend-screen filter blur-[100px] opacity-30"
                />

                {/* Pink Blob */}
                <motion.div
                    animate={{
                        x: [0, 60, -60, 0],
                        y: [0, 40, -60, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[5%] left-[25%] w-[45vw] h-[45vw] bg-[#EC4899] rounded-full mix-blend-screen filter blur-[100px] opacity-20"
                />
            </div>

            {/* Center Darkening Radial Gradient (Readability Mask) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(15,23,42,0.4)_0%,rgba(15,23,42,0.8)_100%)]" />

            {/* Optional Soft Grid overlay for depth */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>
    );
}
