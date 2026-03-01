'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Zap, Layers, Activity, Target, CheckCircle2, Bot } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';
import dynamic from 'next/dynamic';

const KnowledgeNebula = dynamic(
    () => import('@/components/ui/knowledge-nebula').then(mod => mod.KnowledgeNebula),
    { ssr: false, loading: () => <div className="w-full h-[500px] rounded-[2rem] glass-card flex items-center justify-center"><Activity className="w-8 h-8 text-primary animate-pulse" /></div> }
);

export default function ProgressPage() {
    const [progressStats, setProgressStats] = useState<any>(null);
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [progRes, anRes] = await Promise.all([
                    apiFetch('http://localhost:8000/api/v1/progress/'),
                    apiFetch('http://localhost:8000/api/v1/analytics/summary')
                ]);

                if (progRes.ok) setProgressStats(await progRes.json());
                if (anRes.ok) setAnalyticsData(await anRes.json());
            } catch (err) {
                console.error("Failed to load progress data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const generateHeatmapData = () => {
        // Generate 20 weeks * 7 days mock data
        const weeks = [];
        for (let w = 0; w < 24; w++) {
            const days = [];
            for (let d = 0; d < 7; d++) {
                // Bias slightly towards recent weeks (higher index) and weekdays (d > 0 && d < 6)
                let chance = 0.7;
                if (d === 0 || d === 6) chance = 0.85; // Less likely on weekends
                if (w > 20) chance -= 0.2; // More likely recently

                const intensity = Math.random() > chance ? Math.floor(Math.random() * 4) + 1 : 0;
                days.push(intensity);
            }
            weeks.push(days);
        }
        return weeks;
    };

    // Memoize so it doesn't jump on renders
    const [heatmapData] = useState(() => generateHeatmapData());
    return (
        <div className="flex flex-col lg:flex-row h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-background overflow-y-auto lg:overflow-hidden custom-scrollbar">
            <div className="flex-1 overflow-y-auto w-full p-4 md:p-8 custom-scrollbar">

                {/* Header */}
                <div className="flex items-center justify-between mb-6 md:mb-8 max-w-6xl mx-auto">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent mb-1 md:mb-2">
                            Learning Analytics
                        </h1>
                        <p className="text-sm md:text-base text-zinc-400">Track your verification history and learning velocity.</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 bg-surface border border-border px-4 py-2 rounded-xl shadow-sm">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-zinc-300">This Month</span>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-6">

                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            title="Total Views"
                            value={(analyticsData?.total_queries || 0).toString()}
                            subtitle="AI Interactions"
                            icon={<Calendar className="w-5 h-5 text-blue-400" />}
                            trend="Live"
                        />
                        <StatCard
                            title="Current Streak"
                            value={`${progressStats?.longest_streak_days || 0} Days`}
                            subtitle={`Record: ${progressStats?.longest_streak_days || 0}`}
                            icon={<Zap className="w-5 h-5 text-amber-400" />}
                            trend={progressStats?.longest_streak_days > 0 ? 'Active!' : 'Start now'}
                        />
                        <StatCard
                            title="Total XP"
                            value={progressStats?.xp || 0}
                            subtitle={`Level ${progressStats?.level || 1}`}
                            icon={<Layers className="w-5 h-5 text-purple-400" />}
                            trend="+100 rank"
                        />
                        <StatCard
                            title="Code Reviews"
                            value={analyticsData?.total_code_reviews || 0}
                            subtitle="Analyzed by AI"
                            icon={<Activity className="w-5 h-5 text-emerald-400" />}
                            trend="Active"
                        />
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Left Column: Charts & Graphs */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Knowledge Nebula (3D Constellation Map replacing 2D Heatmap) */}
                            <div className="relative">
                                <KnowledgeNebula />
                            </div>

                            {/* Topic Distribution */}
                            <div className="glass-card glow-border p-6 md:p-8 preserve-3d float-card">
                                <h2 className="text-base md:text-lg font-semibold text-zinc-200 mb-6 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-400" />
                                    Knowledge Distribution
                                </h2>
                                <div className="space-y-5">
                                    <ProgressRow label="Frontend Architecture" percent={85} color="bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                    <ProgressRow label="Distributed Systems" percent={60} color="bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                                    <ProgressRow label="Algorithms & Data Structures" percent={40} color="bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                    <ProgressRow label="Database Design" percent={25} color="bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Timeline */}
                        <div className="glass-card glow-border p-6 shadow-sm flex flex-col h-[500px] md:h-[700px] preserve-3d float-card">
                            <h2 className="text-base md:text-lg font-bold text-zinc-200 mb-6 flex items-center gap-2 sticky top-0 z-10 pb-2 bg-transparent backdrop-blur-md">
                                <TrendingUp className="w-5 h-5 text-accent" />
                                Learning Synthesis Timeline
                            </h2>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
                                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

                                <div className="space-y-6 relative">
                                    {analyticsData?.total_queries > 0 || analyticsData?.total_code_reviews > 0 ? (
                                        <>
                                            <TimelineItem
                                                date="Today, 10:42 AM"
                                                title="Code Analysis Verified"
                                                desc="Used AI Consensus to review python infrastructure authentication."
                                                type="verify"
                                                active={true}
                                            />
                                            <TimelineItem
                                                date="Yesterday"
                                                title="Knowledge Milestone Reached"
                                                desc="Mastered fundamental concepts in Distributed Systems architecture."
                                                type="milestone"
                                            />
                                            {analyticsData?.total_notes > 0 && (
                                                <TimelineItem
                                                    date="2 Days Ago"
                                                    title={`Condensed ${analyticsData.total_notes} Learning Notes`}
                                                    desc="Saved critical references from recent mentor sessions."
                                                    type="note"
                                                />
                                            )}
                                            <TimelineItem
                                                date="Last Week"
                                                title="Mentorship Session"
                                                desc="Explored algorithm complexity scaling across environments."
                                                type="chat"
                                            />
                                        </>
                                    ) : (
                                        <div className="text-sm text-zinc-500 bg-surface border border-border rounded-xl p-4">No activity yet. Start interacting with the Consensus Engine!</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle, icon, trend }: any) {
    return (
        <div className="glass-card glow-border p-5 relative overflow-hidden group hover:border-zinc-500 transition-colors preserve-3d float-card">
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 transition-colors">
                    {icon}
                </div>
                <div className="text-[10px] md:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap ml-2 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    {trend}
                </div>
            </div>
            <div className="relative z-10 mt-3 md:mt-4">
                <h3 className="text-xl md:text-2xl font-black text-zinc-100 drop-shadow-md">{value}</h3>
                <p className="text-[13px] md:text-sm font-bold tracking-wide text-zinc-300 mt-1 truncate">{title}</p>
                <p className="text-[11px] md:text-xs font-medium text-zinc-500 mt-0.5 md:mt-1 truncate">{subtitle}</p>
            </div>
        </div>
    );
}

function ProgressRow({ label, percent, color }: { label: string, percent: number, color: string }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-[13px] md:text-sm text-zinc-300">{label}</span>
                <span className="text-[13px] md:text-sm text-zinc-500">{percent}%</span>
            </div>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden border border-border">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percent}%` }} />
            </div>
        </div>
    );
}

function TimelineItem({ date, title, desc, type, active }: any) {
    const getIcon = () => {
        switch (type) {
            case 'milestone': return <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />;
            case 'verify': return <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)] animate-pulse" />;
            case 'note': return <div className="w-2.5 h-2.5 rounded border-2 border-blue-400 bg-background" />;
            case 'chat': return <Bot className="w-3.5 h-3.5 text-purple-400" />;
            default: return <div className="w-2 h-2 rounded-full bg-zinc-500" />;
        }
    };

    return (
        <div className="relative pl-10 group">
            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full bg-surface border-4 ${active ? 'border-surfaceHover' : 'border-background'} flex items-center justify-center z-10 flex-shrink-0 transition-colors group-hover:border-surfaceHover`}>
                {getIcon()}
            </div>
            <div className="pt-0.5">
                <div className="text-[11px] md:text-xs text-zinc-500 mb-1 font-medium tracking-wide">{date}</div>
                <div className={`text-[13px] md:text-sm font-bold ${type === 'milestone' ? 'text-amber-400' : 'text-zinc-100'}`}>
                    {title}
                </div>
                {desc && (
                    <div className="mt-2.5 bg-surface/40 hover:bg-surface/60 transition-colors border border-white/5 rounded-xl p-3 shadow-sm">
                        <p className="text-[12px] md:text-[13px] text-zinc-400 leading-relaxed">
                            {desc}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
