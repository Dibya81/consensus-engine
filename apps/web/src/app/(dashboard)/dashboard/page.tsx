'use client';

import React, { useEffect, useState } from 'react';
import {
    MessageSquare, BookOpen, Code,
    LineChart, ArrowRight, Plus
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/apiClient';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PremiumBackground from '@/components/ui/premium-background';

export default function DashboardPage() {
    const { user } = useAuth();
    const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Student';

    const [stats, setStats] = useState({
        total_queries: 0,
        notes_created: 0,
        code_reviewed: 0,
        topics_studied: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await apiFetch('http://localhost:8000/api/v1/analytics/summary');
                const data = await res.json();
                if (data.status === 'success') {
                    setStats(data.data);
                }
            } catch (err) {
                console.error("Failed to load analytics", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-y-auto overflow-x-hidden pt-24 pb-32 bg-[#0F1117] text-slate-50">
            {/* Standard Dashboard Content */}
            <div className="relative z-10 px-6 max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Section */}
                <div className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                            Welcome back, {firstName}
                            <motion.span
                                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                                className="origin-bottom-right inline-block"
                            >
                                👋
                            </motion.span>
                        </h1>
                        <p className="text-zinc-400 text-lg">What would you like to learn today?</p>
                    </div>

                    {/* Primary Action Buttons */}
                    <div className="flex flex-wrap gap-3 mt-2">
                        <Link href="/mentor" className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
                            <MessageSquare className="w-4 h-4" />
                            Ask AI Mentor
                        </Link>
                        <Link href="/notes" className="flex items-center gap-2 px-5 py-2.5 bg-[#161A23] hover:bg-[#1C2230] border border-white/10 text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
                            <ArrowRight className="w-4 h-4 text-zinc-400" />
                            Continue Last Session
                        </Link>
                        <Link href="/notes?new=true" className="flex items-center gap-2 px-5 py-2.5 bg-[#161A23] hover:bg-[#1C2230] border border-white/10 text-white rounded-xl font-medium transition-colors shadow-sm text-sm">
                            <Plus className="w-4 h-4 text-zinc-400" />
                            Create New Note
                        </Link>
                    </div>
                </div>

                {/* Content Modules Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* A) AI Mentor */}
                    <div className="bg-[#161A23] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">AI Mentor</h2>
                        </div>
                        <p className="text-zinc-400 text-sm mb-6 flex-1">
                            Ask questions and get verified answers from multiple AI models.
                        </p>
                        <Link href="/mentor" className="flex items-center justify-center w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors text-sm border border-white/5">
                            Start Chat
                        </Link>
                    </div>

                    {/* B) Notes */}
                    <div className="bg-[#161A23] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Notes</h2>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-6 flex-1">
                            <div className="text-zinc-400">
                                <span className="text-white font-medium">{stats.notes_created}</span> total notes
                            </div>
                            <div className="text-zinc-500 truncate max-w-[150px] text-right">
                                {stats.notes_created > 0 ? 'Recent: Machine Learning...' : 'No notes yet'}
                            </div>
                        </div>
                        <Link href="/notes" className="flex items-center justify-center w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors text-sm border border-white/5">
                            Open Notes
                        </Link>
                    </div>

                    {/* C) Code Hub */}
                    <div className="bg-[#161A23] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <Code className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Code Hub</h2>
                        </div>
                        <p className="text-zinc-400 text-sm mb-6 flex-1">
                            <span className="text-white font-medium">{stats.code_reviewed}</span> files reviewed by AI consensus.
                        </p>
                        <Link href="/code" className="flex items-center justify-center w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors text-sm border border-white/5">
                            Open Editor
                        </Link>
                    </div>

                    {/* D) Progress */}
                    <div className="bg-[#161A23] border border-white/5 rounded-2xl p-6 flex flex-col hover:border-white/10 transition-colors shadow-sm">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                                <LineChart className="w-5 h-5" />
                            </div>
                            <h2 className="text-lg font-semibold text-white">Progress</h2>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-6 flex-1">
                            <div className="text-zinc-400">
                                <span className="text-white font-medium">{stats.topics_studied}</span> topics learned
                            </div>
                            <div className="flex items-center gap-1.5 text-orange-400 bg-orange-400/10 px-2.5 py-1 rounded-full text-xs font-semibold">
                                🔥 3 Day Streak
                            </div>
                        </div>
                        <Link href="/progress" className="flex items-center justify-center w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors text-sm border border-white/5">
                            View Progress
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
