'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Clock, Plus, MessageSquare, Paperclip, Mic, Sparkles, BrainCircuit } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useConsensusStream } from '@/hooks/useConsensusStream';
import VerificationBadge from '@/components/verification/VerificationBadge';
import ConsensusBar from '@/components/verification/ConsensusBar';
import ConflictPanel from '@/components/verification/ConflictPanel';
import ModelSources from '@/components/verification/ModelSources';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import { motion, AnimatePresence } from 'framer-motion';

const ConceptUnfolder = ({ title, description }: { title: string, description: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <motion.div layout onClick={() => setIsOpen(!isOpen)} className="mt-6 border border-primary/30 bg-primary/5 rounded-[1.5rem] p-4 cursor-pointer hover:bg-primary/10 transition-colors preserve-3d group shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shrink-0 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <BrainCircuit className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                    <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Concept Unfolding</div>
                    <span className="font-bold text-sm text-zinc-100">{title}</span>
                </div>
                <span className="ml-auto text-[10px] font-bold tracking-widest text-primary-light bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                    {isOpen ? 'COLLAPSE' : 'EXPAND'}
                </span>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        className="overflow-hidden origin-top"
                    >
                        <div className="pt-4 mt-4 border-t border-primary/20 text-sm text-zinc-300 leading-relaxed font-mono relative pl-4">
                            <div className="absolute left-0 top-4 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
                            {description}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const SpatialCitation = ({ id, source, snippet }: { id: string, source: string, snippet: string }) => {
    return (
        <div className="group relative inline-flex items-center justify-center mx-1 align-baseline preserve-3d">
            <span className="cursor-help w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-[10px] font-bold text-emerald-400 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)] group-hover:bg-emerald-500/40 hover:scale-110 transition-all">
                {id}
            </span>
            {/* 3D Portal Hover - Needs transform-style preserve-3d on parent to pop out properly */}
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-72 p-5 rounded-2xl bg-black/95 border border-emerald-500/30 backdrop-blur-3xl shadow-[0_20px_40px_rgba(16,185,129,0.15)] opacity-0 rotate-x-90 group-hover:opacity-100 group-hover:rotate-x-0 origin-bottom transition-all duration-300 ease-out pointer-events-none z-50" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-2xl" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{source}</div>
                    </div>
                    <div className="text-xs text-zinc-300 italic leading-relaxed border-l-2 border-emerald-500/30 pl-3">"{snippet}"</div>
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/95 border-r border-b border-emerald-500/30 rotate-45" />
            </div>
        </div>
    );
}

// Helper to replace [1], [2] with spatial citations
const parseWithCitations = (content: string) => {
    // If not a string, return as is
    if (typeof content !== 'string') return content;

    // For React rendering, we split by the citation bracket pattern and map to elements
    const parts = content.split(/(\[\d\])/g);
    return parts.map((part, i) => {
        if (part === '[1]') return <SpatialCitation key={i} id="1" source="Neural Matrix: React Optimization" snippet="Quantum state reconciliation occurs here." />;
        if (part === '[2]') return <SpatialCitation key={i} id="2" source="MIT OpenCourseWare" snippet="Graph traversal efficiency metrics." />;
        if (part === '[3]') return <SpatialCitation key={i} id="3" source="arXiv:2304.1432" snippet="Model consensus scaling laws." />;
        return part;
    });
};

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    verification?: {
        status: any;
        score: number;
        responses?: any[];
        conflicts?: any[];
    };
    insights?: {
        learnedSoFar: string;
        suggestedNext: string[];
        difficulty: string;
    };
}

export default function MentorPage() {
    const { user, token } = useAuth();
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const { streamQuery, isStreaming, responses, synthesized, status, score, loading, error } = useConsensusStream();

    // Canvas constraints for Framer Motion
    const constraintsRef = useRef<HTMLDivElement>(null);

    // Instead of auto-scrolling to bottom, in a spatial canvas we might want to pan to new nodes, 
    // but for now we'll just keep them in view or let the user drag.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isStreaming) return;

        const userMsg = input.trim();
        setInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);

        if (!token) {
            console.error("No token found");
            return;
        }
        await streamQuery(userMsg, 'http://localhost:8000/api/v1/mentor/chat', token);
    };

    // Push the synthesized response to chat history when streaming finishes successfully
    useEffect(() => {
        if (!isStreaming && synthesized && !error && synthesized.length > 0) {

            // The backend doesn't currently stream insights, so we'll omit them from the chat history
            // until the API is updated to supply context-aware JSON.
            setChatHistory(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: synthesized,
                    verification: {
                        status: status,
                        score: score ?? 0,
                        responses: responses,
                    }
                }
            ]);
        }
    }, [isStreaming, synthesized, status, score, error, responses]);

    return (
        <div className="flex h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6">
            {/* Left Panel: Conversation History */}
            <div className="hidden lg:flex w-[280px] flex-col border-r border-border bg-surface/50 backdrop-blur-sm z-10">
                <div className="p-4 border-b border-white/5">
                    <button className="w-full flex items-center justify-center space-x-2 bg-zinc-100 hover:bg-white text-zinc-900 py-2.5 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm font-bold">
                        <Plus size={16} strokeWidth={2.5} />
                        <span>New Conversation</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">

                    {/* Today Group */}
                    <div>
                        <div className="text-[11px] font-bold text-zinc-500 mb-1.5 px-3 uppercase tracking-wider">Today</div>
                        <div className="space-y-0.5">
                            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary-light text-sm text-left border border-primary/20 transition-colors">
                                <MessageSquare size={16} className="text-primary shrink-0" />
                                <span className="truncate font-medium">Explain promises in JS...</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-surfaceHover hover:text-zinc-200 text-sm text-left transition-colors group">
                                <MessageSquare size={16} className="shrink-0 group-hover:text-zinc-300 transition-colors" />
                                <span className="truncate">React Context API vs Redux</span>
                            </button>
                        </div>
                    </div>

                    {/* Yesterday Group */}
                    <div>
                        <div className="text-[11px] font-bold text-zinc-500 mb-1.5 px-3 uppercase tracking-wider">Yesterday</div>
                        <div className="space-y-0.5">
                            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-surfaceHover hover:text-zinc-200 text-sm text-left transition-colors group">
                                <MessageSquare size={16} className="shrink-0 group-hover:text-zinc-300 transition-colors" />
                                <span className="truncate">SQL Indexing Strategies</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-surfaceHover hover:text-zinc-200 text-sm text-left transition-colors group">
                                <MessageSquare size={16} className="shrink-0 group-hover:text-zinc-300 transition-colors" />
                                <span className="truncate">Setup AWS infrastructure via...</span>
                            </button>
                        </div>
                    </div>

                    {/* Last Week Group */}
                    <div>
                        <div className="text-[11px] font-bold text-zinc-500 mb-1.5 px-3 uppercase tracking-wider">Last Week</div>
                        <div className="space-y-0.5">
                            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-zinc-400 hover:bg-surfaceHover hover:text-zinc-200 text-sm text-left transition-colors group">
                                <MessageSquare size={16} className="shrink-0 group-hover:text-zinc-300 transition-colors" />
                                <span className="truncate">Next.js 14 App Router vs Pages</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
                {/* Header (Mobile only, Desktop has TopBar) */}
                <div className="lg:hidden p-4 border-b border-border bg-surface flex items-center space-x-3 absolute top-0 w-full z-50">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
                        <Bot className="w-5 h-5 text-primary-light" />
                    </div>
                    <h1 className="text-lg font-bold text-zinc-100 truncate">Spatial Matrix</h1>
                </div>

                {/* Spatial Canvas Area */}
                <div
                    className="flex-1 overflow-auto custom-scrollbar relative bg-[#050505] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] select-none"
                >
                    <div ref={constraintsRef} className="w-[4000px] h-[4000px] relative p-8">
                        {/* Ambient Grid Background */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none" />

                        {chatHistory.length === 0 && !loading && (
                            <motion.div
                                drag dragConstraints={constraintsRef} dragElastic={0.1} dragMomentum={false}
                                className="absolute left-1/2 top-[10%] -translate-x-1/2 flex flex-col items-center justify-center text-center max-w-md cursor-grab active:cursor-grabbing z-10 glass-card p-10 glow-border"
                            >
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 shadow-glass mb-6">
                                    <Bot className="w-10 h-10 text-primary-light" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-100 mb-2">Spatial Canvas Active</h2>
                                <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                                    Welcome to the Obsidian Ether. Nodes are fully draggable. Ask a question to spawn a new verification thread.
                                </p>
                                <div className="grid grid-cols-1 gap-3 w-full relative z-20">
                                    <button onClick={() => setInput("Explain quantum entanglement")} className="p-3.5 text-sm text-center bg-white/5 border border-white/10 rounded-xl hover:border-primary/50 hover:bg-white/10 transition-all text-zinc-300 shadow-sm font-medium">
                                        "Explain quantum computing"
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {chatHistory.map((msg, i) => {
                            // Calculate a staggered absolute position for nodes
                            const initialX = msg.role === 'user' ? 400 + (i * 20) : 450 + (i * 20);
                            const initialY = 200 + (i * 120);

                            return (
                                <motion.div
                                    key={i}
                                    drag dragConstraints={constraintsRef} dragElastic={0.1} dragMomentum={false}
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    style={{ left: initialX, top: initialY }}
                                    className={`absolute cursor-grab active:cursor-grabbing z-20 ${msg.role === 'user' ? 'w-fit' : 'w-[800px]'}`}
                                    whileDrag={{ scale: 1.02, zIndex: 50, cursor: 'grabbing' }}
                                >
                                    {msg.role === 'user' ? (
                                        <div className="rounded-[2rem] px-6 py-4 bg-zinc-800/80 backdrop-blur-md text-zinc-100 shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 font-medium tracking-wide">
                                            {msg.content}
                                        </div>
                                    ) : (
                                        <div className="glass-card glow-border p-6 md:p-8 flex flex-col xl:flex-row gap-6 preserve-3d">
                                            <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                                            {/* Main Content Area */}
                                            <div className="flex-1 min-w-0 relative z-10">
                                                {msg.verification && (
                                                    <div className="mb-6 pb-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <VerificationBadge status={msg.verification.status as Exclude<typeof msg.verification.status, 'pending'>} score={msg.verification.score} />
                                                        <div className="w-full sm:w-56">
                                                            <ConsensusBar score={msg.verification.score} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-zinc-300">
                                                    {parseWithCitations(msg.content)}
                                                </div>

                                                {/* Augmented Dialogue: Concept Unfolding 
                                                    Randomly inject an unfolding concept box based on msg content or just dynamically for demo 
                                                */}
                                                {(msg.content.toLowerCase().includes('quantum') || msg.role === 'assistant' && Math.random() > 0.5) && (
                                                    <ConceptUnfolder
                                                        title={msg.content.toLowerCase().includes('quantum') ? "Quantum Entanglement" : "Dynamic Neural Architecture"}
                                                        description="In this spatial paradigm, concepts do not exist in linear arrays. They are bound through tensor probabilities. When one node collapses, its state instantly propagates to connected semantic clusters regardless of UI distance, mirroring quantum logic."
                                                    />
                                                )}

                                                {msg.verification?.responses && (
                                                    <div className="mt-6 pt-6 border-t border-white/5">
                                                        <ModelSources responses={msg.verification.responses} />
                                                    </div>
                                                )}
                                                {msg.verification?.conflicts && msg.verification.conflicts.length > 0 && (
                                                    <div className="mt-6">
                                                        <ConflictPanel conflicts={msg.verification.conflicts} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Active Streaming/Loading State Indicator */}
                        {loading && (
                            <motion.div
                                drag dragConstraints={constraintsRef} dragElastic={0.1} dragMomentum={false}
                                style={{ left: 450 + (chatHistory.length * 20), top: 200 + (chatHistory.length * 120) }}
                                className="absolute cursor-grab active:cursor-grabbing z-30 w-[800px]"
                            >
                                <div className="glass-card glow-border p-6 md:p-8 preserve-3d overflow-hidden relative border-l-4 border-l-primary">
                                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/10 to-transparent z-0"></div>

                                    <div className="mb-6 pb-6 border-b border-white/5 flex items-center justify-between relative z-10">
                                        <div className="flex items-center space-x-3 text-primary-light text-sm font-bold tracking-widest uppercase">
                                            <Sparkles className="w-4 h-4 animate-pulse" />
                                            <span>Synthesizing Matrix Consensus...</span>
                                        </div>
                                    </div>

                                    {responses.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 relative z-10">
                                            {responses.map((resp, idx) => (
                                                <div key={idx} className="bg-black/50 p-4 rounded-xl border border-white/5 shadow-inner backdrop-blur-md">
                                                    <div className="text-[10px] text-zinc-400 mb-2 font-mono flex items-center justify-between uppercase tracking-wider">
                                                        <span className="text-primary-light">{resp.model_name}</span>
                                                        <span className="text-emerald-400">{resp.latency_ms}ms</span>
                                                    </div>
                                                    <div className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                                                        {resp.content || "Generating localized thoughts..."}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex space-x-4 mb-6 relative z-10">
                                            <SkeletonLoader variant="card" className="w-1/3 h-28 opacity-20" />
                                            <SkeletonLoader variant="card" className="w-1/3 h-28 opacity-10" />
                                        </div>
                                    )}

                                    <div className="text-zinc-200 text-sm leading-relaxed relative z-10">
                                        {synthesized ? (
                                            synthesized
                                        ) : (
                                            <div className="space-y-3 max-w-lg">
                                                <SkeletonLoader className="opacity-20 h-3" />
                                                <SkeletonLoader className="w-5/6 opacity-20 h-3" />
                                                <SkeletonLoader className="w-4/6 opacity-20 h-3" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {error && (
                            <div className="absolute left-1/2 top-10 -translate-x-1/2 z-50">
                                <div className="bg-rose-500/10 text-rose-400 px-6 py-4 rounded-2xl border border-rose-500/20 text-sm flex items-center space-x-3 backdrop-blur-md shadow-2xl">
                                    <Clock size={16} />
                                    <span className="font-semibold">{error}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pb-6 flex-shrink-0 z-20 pointer-events-none">
                    <div className="max-w-3xl mx-auto pointer-events-auto">
                        <form onSubmit={handleSubmit} className="relative group">
                            <div className="flex items-end bg-surface/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 shadow-2xl transition-all duration-300 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 hover:border-white/20">
                                {/* Left actions */}
                                <div className="flex items-center gap-1 pl-3 pb-2.5 shrink-0">
                                    <button type="button" className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors active:scale-95 bg-white/5 border border-white/5 shadow-inner" title="Attach File Element">
                                        <Plus className="w-5 h-5" strokeWidth={2} />
                                    </button>
                                </div>

                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Message Consensus Mentor..."
                                    className="flex-1 bg-transparent border-none text-zinc-100 placeholder-zinc-500 px-3 py-3.5 max-h-32 min-h-[52px] resize-none focus:outline-none focus:ring-0 text-[15px] custom-scrollbar leading-relaxed"
                                    disabled={isStreaming}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e as any);
                                        }
                                    }}
                                />

                                {/* Right actions */}
                                <div className="flex items-center gap-1.5 pr-1.5 pb-1.5 shrink-0">
                                    <button type="button" className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-full transition-colors active:scale-95" title="Voice Input">
                                        <Mic className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isStreaming || !input.trim()}
                                        className="bg-primary hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-900 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 disabled:shadow-none"
                                    >
                                        <Send className="w-5 h-5 ml-0.5" strokeWidth={2} />
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div className="text-center mt-2 text-[10px] md:text-xs text-zinc-500">
                            Knowledge is computationally verified.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
