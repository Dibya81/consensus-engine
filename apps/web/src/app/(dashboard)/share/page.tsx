'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, QrCode, Smartphone, ExternalLink, Clock, FileText, Code2, Copy, Check, ShieldCheck } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

interface SharedItem {
    id: string;
    type: string;
    title: string;
    date: string;
    views: number;
}

export default function SharePage() {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [sharedItems, setSharedItems] = useState<SharedItem[]>([]);

    useEffect(() => {
        const fetchShares = async () => {
            try {
                const res = await apiFetch('http://localhost:8000/api/v1/share');
                const data = await res.json();
                if (data.status === 'success') {
                    setSharedItems(data.shares);
                }
            } catch (err) {
                console.error("Failed to load shares", err);
            }
        };
        fetchShares();
    }, []);

    const handleCopy = (id: string) => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getIcon = (type: string) => {
        if (type === 'note') return <FileText className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />;
        if (type === 'code') return <Code2 className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />;
        return <Share2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />;
    };

    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-background overflow-y-auto md:overflow-hidden w-[calc(100%+2rem)] md:w-full custom-scrollbar">

            {/* Left Main Content Pane */}
            <div className="flex-1 p-4 md:p-6 lg:p-10 md:overflow-y-auto custom-scrollbar bg-surface/10 relative shrink-0 min-h-[50dvh] md:min-h-0">

                <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 pt-2 md:pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-border">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="p-2.5 md:p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]">
                                <Share2 className="w-6 h-6 md:w-8 md:h-8 text-pink-500" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold text-zinc-100">Share Center</h1>
                                <p className="text-zinc-400 text-[11px] md:text-sm mt-0.5 md:mt-1">Manage and distribute your verified AI consensus results.</p>
                            </div>
                        </div>
                        <button className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[13px] md:text-sm font-semibold transition-colors shadow-glow flex items-center justify-center gap-2 min-h-[44px]">
                            <LinkIcon className="w-4 h-4" /> New Link
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-6 md:mb-8">
                        <div className="bg-surface border border-border rounded-xl md:rounded-2xl p-4 md:p-6">
                            <div className="text-zinc-400 text-[11px] md:text-sm font-medium mb-1">Total Views</div>
                            <div className="text-2xl md:text-3xl font-bold text-zinc-100">65</div>
                            <div className="text-[10px] md:text-xs text-emerald-400 mt-1 md:mt-2 flex items-center gap-1">↑ 12% from last week</div>
                        </div>
                        <div className="bg-surface border border-border rounded-xl md:rounded-2xl p-4 md:p-6">
                            <div className="text-zinc-400 text-[11px] md:text-sm font-medium mb-1">Active Links</div>
                            <div className="text-2xl md:text-3xl font-bold text-zinc-100">{sharedItems.length}</div>
                            <div className="text-[10px] md:text-xs text-zinc-500 mt-1 md:mt-2">Managing {sharedItems.length} active shares</div>
                        </div>
                        <div className="bg-surface border border-border rounded-xl md:rounded-2xl p-4 md:p-6 col-span-2 md:col-span-1">
                            <div className="text-zinc-400 text-[11px] md:text-sm font-medium mb-1">Items Verified</div>
                            <div className="text-2xl md:text-3xl font-bold text-zinc-100">100%</div>
                            <div className="text-[10px] md:text-xs text-emerald-400 mt-1 md:mt-2 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> All shares multi-verified</div>
                        </div>
                    </div>

                    <div className="bg-surface border border-border rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
                        <div className="p-4 md:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 bg-surfaceHover/50">
                            <h2 className="text-base md:text-lg font-bold text-zinc-100">Recent Shares</h2>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button className="flex-1 sm:flex-none px-3 py-1.5 md:py-2 text-[11px] md:text-xs font-medium bg-zinc-800 text-zinc-300 rounded-lg md:rounded border border-border hover:bg-zinc-700 transition-colors min-h-[36px] md:min-h-0">All Types</button>
                                <button className="flex-1 sm:flex-none px-3 py-1.5 md:py-2 text-[11px] md:text-xs font-medium bg-background text-zinc-500 rounded-lg md:rounded border border-transparent hover:text-zinc-300 transition-colors min-h-[36px] md:min-h-0">Most Viewed</button>
                            </div>
                        </div>
                        <div className="divide-y divide-border">
                            {sharedItems.map((item) => (
                                <div key={item.id} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-surfaceHover transition-colors group gap-4 sm:gap-0">
                                    <div className="flex items-start md:items-center space-x-3 md:space-x-4 w-full">
                                        <div className="p-2 md:p-2.5 bg-background rounded-lg border border-border group-hover:scale-110 transition-transform shadow-sm shrink-0">
                                            {getIcon(item.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-sm md:text-base text-zinc-200 font-semibold mb-1 group-hover:text-primary transition-colors truncate">{item.title}</h3>
                                            <div className="flex flex-wrap items-center text-[10px] md:text-xs text-zinc-500 gap-x-2 gap-y-1">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.date}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {item.views} views</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="bg-primary/10 text-primary px-1.5 py-[1px] rounded font-medium">Verified by 3 Models</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border sm:border-transparent">
                                        <div className="flex items-center text-[11px] md:text-xs text-zinc-500 font-mono bg-[#0d1117] px-2 py-1.5 md:py-1 rounded border border-border min-h-[36px] md:min-h-0">
                                            ce.sh/{item.id}
                                            <button
                                                onClick={() => handleCopy(item.id)}
                                                className="ml-3 sm:ml-2 p-1 md:p-0 hover:text-zinc-300 transition-colors flex items-center justify-center min-w-[24px] min-h-[24px]"
                                            >
                                                {copiedId === item.id ? <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Offline Share Pane */}
            <div className="w-full md:w-80 lg:w-96 border-t md:border-t-0 md:border-l border-border bg-surface/30 flex flex-col p-4 md:p-6 md:overflow-y-auto custom-scrollbar shrink-0 pb-10 md:pb-6">

                <div className="mb-6 md:mb-8">
                    <h2 className="text-base md:text-lg font-bold text-zinc-100 flex items-center gap-2 mb-1.5 md:mb-2">
                        <Smartphone className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Offline Sharing
                    </h2>
                    <p className="text-[11px] md:text-xs text-zinc-400 leading-relaxed">
                        Share your verified notes and insights instantly with devices nearby, even without an active internet connection.
                    </p>
                </div>

                <div className="space-y-4 md:space-y-6 flex-1">

                    {/* QR Code Demo */}
                    <div className="bg-surface/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 relative overflow-hidden group shadow-2xl">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-10 h-10 bg-white/10 rounded-2xl mb-4 p-2.5 border border-white/20 shadow-inner group-hover:bg-white/20 transition-colors">
                                <QrCode className="w-full h-full text-primary-light" />
                            </div>
                            <h3 className="text-[15px] font-bold text-zinc-100 mb-1">Architecture Note</h3>
                            <p className="text-[12px] text-zinc-500 font-mono mb-6">ce.sh/x8f2a</p>

                            <div className="bg-white p-3 rounded-[1.5rem] w-44 h-44 aspect-square relative shadow-lg group-hover:scale-105 transition-transform duration-500 border-4 border-white/5">
                                {/* Mock QR Pattern */}
                                <div className="grid grid-cols-5 grid-rows-5 gap-1.5 w-full h-full opacity-90">
                                    {Array.from({ length: 25 }).map((_, i) => (
                                        <div key={i} className={`bg-zinc-900 rounded-sm ${(i % 2 === 0 || i % 3 === 0 || i === 12) ? 'opacity-100' : 'opacity-0'}`} />
                                    ))}
                                    {/* QR Corners */}
                                    <div className="absolute top-2 left-2 w-8 h-8 border-[5px] border-zinc-900 rounded-lg" />
                                    <div className="absolute top-2 right-2 w-8 h-8 border-[5px] border-zinc-900 rounded-lg" />
                                    <div className="absolute bottom-2 left-2 w-8 h-8 border-[5px] border-zinc-900 rounded-lg" />
                                </div>
                            </div>

                            <div className="w-full mt-6 flex gap-2">
                                <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold rounded-xl transition-colors border border-white/10 shadow-sm">
                                    Copy Link
                                </button>
                                <button className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors shadow-glow">
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Bluetooth Payload Demo */}
                    <div className="bg-surface/40 border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group">
                        <h3 className="text-[14px] font-bold text-zinc-100 mb-6 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-blue-400" /> Nearby Share
                        </h3>

                        {/* Radar Animation */}
                        <div className="relative w-full h-48 bg-[#0a0d14] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden mb-6 shadow-inner">
                            {/* Core Device */}
                            <div className="w-14 h-14 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center z-20 relative shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                                <Smartphone className="w-6 h-6 text-blue-400" />

                                {/* Ripples */}
                                <div className="absolute inset-[-1px] rounded-full border border-blue-500/50 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute inset-[-1px] rounded-full border border-blue-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
                                <div className="absolute inset-[-1px] rounded-full border border-blue-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_2s]" />
                            </div>

                            {/* Found Devices */}
                            <div className="absolute top-8 left-[20%] w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-lg hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer group/device z-30">
                                <Smartphone className="w-4 h-4 text-zinc-400 group-hover/device:text-blue-400" />
                                <div className="absolute -bottom-6 text-[10px] text-zinc-500 font-medium opacity-0 group-hover/device:opacity-100 transition-opacity whitespace-nowrap">Dibya's iPhone</div>
                            </div>
                            <div className="absolute bottom-10 right-[25%] w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center shadow-lg hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer group/device z-30">
                                <Smartphone className="w-5 h-5 text-zinc-300 group-hover/device:text-blue-400" />
                                <div className="absolute -bottom-6 text-[10px] text-zinc-500 font-medium opacity-0 group-hover/device:opacity-100 transition-opacity whitespace-nowrap">Alex's Mac</div>
                            </div>

                            {/* Radar Sweep Line */}
                            <div className="absolute top-1/2 left-1/2 w-[150%] h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent origin-left rotate-0 animate-[spin_4s_linear_infinite] z-10 pointer-events-none" />
                        </div>

                        <button className="w-full py-3 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-bold rounded-xl transition-all border border-blue-500/20 flex items-center justify-center gap-2 shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            Broadcasting to Nearby Devices
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}
