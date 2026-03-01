'use client';

import React, { useState } from 'react';
import { Briefcase, FileText, Send, Compass, Shield, Code2, GraduationCap, MapPin, Target, Sparkles, CheckCircle } from 'lucide-react';
import { useConsensusStream } from '@/hooks/useConsensusStream';
import { useAuth } from '@/context/AuthContext';
import VerificationBadge from '@/components/verification/VerificationBadge';
import ConsensusBar from '@/components/verification/ConsensusBar';
import SkeletonLoader from '@/components/common/SkeletonLoader';

export default function CareerPage() {
    const [query, setQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'roadmaps' | 'resume'>('roadmaps');
    const { token } = useAuth();
    const { streamQuery, isStreaming, synthesized, status, error, loading, score } = useConsensusStream();

    const handleAdvice = async (customQuery?: string) => {
        const q = customQuery || query;
        if (!q.trim() || isStreaming || !token) return;
        await streamQuery(`Generate a detailed roadmap for: ${q}`, 'http://localhost:8000/api/v1/career/advice', token);
    };

    const pathways = [
        { id: 'web', title: 'Full Stack Web Dev', icon: <Code2 className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />, desc: 'Modern React, Next.js, Node, and System Design.' },
        { id: 'cyber', title: 'Cybersecurity', icon: <Shield className="w-5 h-5 md:w-6 md:h-6 text-rose-400" />, desc: 'Ethical Hacking, Network Security, and Compliance.' },
        { id: 'dsa', title: 'DSA & Competitive', icon: <Target className="w-5 h-5 md:w-6 md:h-6 text-emerald-400" />, desc: 'Data structures, algorithms, and FAANG prep.' },
        { id: 'placement', title: 'Campus Placements', icon: <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />, desc: 'Aptitude, Core CS subjects, and mock interviews.' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-background overflow-y-auto md:overflow-hidden w-[calc(100%+2rem)] md:w-full custom-scrollbar">

            {/* Left Context Pane */}
            <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border bg-surface/30 flex flex-col p-4 md:p-6 md:overflow-y-auto custom-scrollbar shrink-0 min-h-[50dvh] md:min-h-0">

                <div className="flex items-center space-x-3 md:space-x-4 mb-6 md:mb-8">
                    <div className="p-2.5 md:p-3 bg-teal-500/20 rounded-xl border border-teal-500/30">
                        <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-teal-400" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-zinc-100">Career Guidance</h1>
                        <p className="text-[11px] md:text-xs text-zinc-400">Verified Pathways & Reviews</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-surface border border-border rounded-lg mb-6 md:mb-8 shrink-0">
                    <button
                        onClick={() => setActiveTab('roadmaps')}
                        className={`flex-1 py-2 text-[13px] md:text-sm font-medium rounded-md transition-all ${activeTab === 'roadmaps' ? 'bg-zinc-800 text-teal-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Roadmaps
                    </button>
                    <button
                        onClick={() => setActiveTab('resume')}
                        className={`flex-1 py-2 text-[13px] md:text-sm font-medium rounded-md transition-all ${activeTab === 'resume' ? 'bg-zinc-800 text-teal-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Resume Review
                    </button>
                </div>

                {activeTab === 'roadmaps' ? (
                    <div className="space-y-6 flex-1 flex flex-col">
                        <div className="space-y-3 shrink-0">
                            <h2 className="text-[11px] md:text-sm font-semibold tracking-wider text-zinc-500 uppercase">Verified Pathways</h2>
                            <div className="grid grid-cols-1 gap-2.5 md:gap-3">
                                {pathways.map((path) => (
                                    <button
                                        key={path.id}
                                        onClick={() => handleAdvice(path.title)}
                                        className="flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-surface border border-border hover:border-teal-500/50 hover:bg-surfaceHover transition-all text-left group min-h-[44px]"
                                    >
                                        <div className="p-2 bg-background rounded-lg border border-border group-hover:scale-110 transition-transform shrink-0">
                                            {path.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-zinc-200 text-[13px] md:text-sm mb-0.5 md:mb-1">{path.title}</h3>
                                            <p className="text-[11px] md:text-xs text-zinc-500 leading-relaxed">{path.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border mt-auto shrink-0 pb-4 md:pb-0">
                            <h2 className="text-[11px] md:text-sm font-semibold tracking-wider text-zinc-500 uppercase mb-3">Custom Goal</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="E.g., Become a DevOps Engineer"
                                    className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 md:py-3 text-base md:text-sm text-zinc-200 focus:outline-none focus:border-teal-500 transition-colors min-h-[44px]"
                                />
                                <button
                                    onClick={() => handleAdvice()}
                                    disabled={isStreaming || !query.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg disabled:opacity-50 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 flex flex-col space-y-4 h-[350px] md:h-[400px] pb-4 md:pb-5">
                        <h2 className="text-[13px] md:text-sm font-semibold text-zinc-200 flex items-center space-x-2 shrink-0">
                            <FileText className="w-4 h-4 text-teal-400" />
                            <span>Paste Your Resume Context</span>
                        </h2>
                        <textarea
                            className="flex-1 w-full bg-[#0d1117] border border-border rounded-xl p-3 md:p-4 text-zinc-300 text-base md:text-sm focus:outline-none focus:border-teal-500 resize-none custom-scrollbar"
                            placeholder="Paste your resume text here. Our multi-agent system will review it against current industry standards..."
                        ></textarea>
                        <button
                            disabled={isStreaming}
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-xl text-[13px] md:text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.2)] shrink-0 min-h-[44px]"
                        >
                            <Sparkles className="w-4 h-4" /> Analyze Resume
                        </button>
                    </div>
                )}
            </div>

            {/* Right Results Pane */}
            <div className="w-full md:flex-1 bg-surface/10 p-4 md:p-6 lg:p-8 md:overflow-y-auto custom-scrollbar relative shrink-0 min-h-[50dvh] md:min-h-0">
                {loading || isStreaming ? (
                    <div className="max-w-3xl mx-auto space-y-6 pt-6 md:pt-10 pb-8">
                        <div className="flex items-center gap-3 md:gap-4 text-teal-400 mb-6 md:mb-8 animate-pulse">
                            <Compass className="w-5 h-5 md:w-6 md:h-6 animate-spin-slow shrink-0" />
                            <h2 className="text-lg md:text-xl font-semibold">Generating consensus roadmap...</h2>
                        </div>
                        <SkeletonLoader variant="text" className="w-3/4" />
                        <SkeletonLoader variant="card" />
                        <SkeletonLoader variant="text" />
                        <SkeletonLoader variant="text" />
                    </div>
                ) : synthesized ? (
                    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-12">

                        <div className="bg-surface/80 border border-border rounded-xl p-4 md:p-6 shadow-lg backdrop-blur-sm space-y-4 sticky top-0 md:top-auto z-10 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <VerificationBadge status={status as any} />
                                {score !== undefined && (
                                    <div className="w-full sm:w-48">
                                        <ConsensusBar score={score} />
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] md:text-xs text-zinc-400 flex items-start sm:items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5 sm:mt-0" />
                                <span>This roadmap has been verified against current job market data across 3 separate AI models.</span>
                            </p>
                        </div>

                        <div className="bg-surface/50 border border-white/5 rounded-2xl p-4 md:p-6 lg:p-8 overflow-x-hidden">
                            <div className="prose prose-sm md:prose-base prose-invert prose-teal max-w-none">
                                <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap break-words text-[14px] md:text-base">
                                    {synthesized}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="max-w-2xl mx-auto mt-10 md:mt-20 px-2 md:px-0 pb-8">
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 md:p-6 rounded-2xl flex items-start gap-3 md:gap-4">
                            <Shield className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold mb-1 text-sm md:text-base">Analysis Failed</h3>
                                <p className="text-xs md:text-sm opacity-90 break-words">{error}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 md:space-y-6 px-4 pb-12 overflow-hidden">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-teal-500/10 rounded-full flex items-center justify-center border border-teal-500/20 shadow-[0_0_30px_rgba(20,184,166,0.1)] shrink-0">
                            <MapPin className="w-8 h-8 md:w-10 md:h-10 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-2">Map Your Journey</h2>
                            <p className="text-zinc-400 text-[13px] md:text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                                Select a verified pathway or enter a custom goal to generate an AI-validated, step-by-step career roadmap.
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
