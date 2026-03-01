'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    BookOpen, Sparkles, Plus, FileText, Clock, ChevronRight, Bot,
    Search, Trash2, Save, X, AlignLeft, Layers, PenTool, BrainCircuit,
    MoreHorizontal
} from 'lucide-react';
import { useConsensusStream } from '@/hooks/useConsensusStream';
import VerificationBadge from '@/components/verification/VerificationBadge';
import ConsensusBar from '@/components/verification/ConsensusBar';
import ConflictPanel from '@/components/verification/ConflictPanel';
import ModelSources from '@/components/verification/ModelSources';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import ErrorBanner from '@/components/common/ErrorBanner';
import { apiFetch } from '@/lib/apiClient';

interface Note {
    id: number;
    title: string;
    content: string;
    updated_at: string;
}

export default function NotesPage() {
    // Core State
    const [notes, setNotes] = useState<Note[]>([]);
    const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('Summarize this note');

    const { streamQuery, isStreaming, responses, synthesized, status, score, error, loading } = useConsensusStream();

    const activeNote = notes.find(n => n.id === activeNoteId);

    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    // Fetch notes on mount
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await apiFetch('http://localhost:8000/api/v1/notes/');
                const data = await res.json();
                if (data.status === 'success') {
                    setNotes(data.notes);
                    if (data.notes.length > 0 && !activeNoteId) {
                        setActiveNoteId(data.notes[0].id);
                    }
                }
            } catch (err) {
                console.error("Failed to load notes", err);
            }
        };
        fetchNotes();
    }, []);

    const handleCreateNote = async () => {
        try {
            const res = await apiFetch('http://localhost:8000/api/v1/notes/', {
                method: 'POST',
                body: JSON.stringify({ title: 'Untitled Note', content: '' })
            });
            const data = await res.json();
            if (data.status === 'success') {
                const newNote = { ...data.note, updated_at: new Date().toISOString() };
                setNotes([newNote, ...notes]);
                setActiveNoteId(newNote.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteNote = async (id: number) => {
        try {
            await apiFetch(`http://localhost:8000/api/v1/notes/${id}`, {
                method: 'DELETE'
            });
            const remaining = notes.filter(n => n.id !== id);
            setNotes(remaining);
            if (activeNoteId === id) {
                setActiveNoteId(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const triggerAutoSave = (id: number, title: string, content: string) => {
        setIsSaving(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await apiFetch(`http://localhost:8000/api/v1/notes/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ title, content })
                });
                // Update local state updated_at
                setNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, updated_at: new Date().toISOString() } : n));
            } catch (err) {
                console.error("Auto-save failed", err);
            } finally {
                setIsSaving(false);
            }
        }, 1000); // 1s debounce
    };

    const updateActiveNote = (updates: Partial<Note>) => {
        if (!activeNoteId) return;
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, ...updates } : n));

        const noteToSave = { ...activeNote, ...updates } as Note;
        triggerAutoSave(activeNoteId, noteToSave.title, noteToSave.content);
    };

    const handleAIAssist = async () => {
        if (!activeNote?.content.trim() || isStreaming) return;
        const fullPrompt = `${aiPrompt}:\n\n${activeNote.content}`;
        await streamQuery(fullPrompt, 'http://localhost:8000/api/v1/notes/generate-summary', '');
    };

    const filteredNotes = notes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-[#0E0E11] text-zinc-300 font-sans tracking-wide">

            {/* 1. LEFT SIDEBAR: Note Explorer */}
            <div className="w-72 border-r border-white/5 bg-[#141418] flex-col hidden lg:flex shrink-0">
                <div className="p-4 flex flex-col gap-4">
                    <button
                        onClick={handleCreateNote}
                        className="w-full py-2.5 px-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary-hover transition-all shadow-lg hover:shadow-primary/20"
                    >
                        <Plus className="w-5 h-5" />
                        <span>New Note</span>
                    </button>

                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search workspace..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-transparent focus:border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 px-3 pt-4">Your Documents</div>

                    {filteredNotes.length === 0 ? (
                        <div className="text-sm text-zinc-500 italic px-4">No notes found.</div>
                    ) : (
                        filteredNotes.map(note => (
                            <div
                                key={note.id}
                                onClick={() => setActiveNoteId(note.id)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer group transition-all ${activeNoteId === note.id ? 'bg-primary/10 text-primary-light' : 'hover:bg-white/5 text-zinc-400'}`}
                            >
                                <FileText className={`w-4 h-4 shrink-0 ${activeNoteId === note.id ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${activeNoteId === note.id ? 'text-zinc-200' : 'text-zinc-400 group-hover:text-zinc-300'}`}>
                                        {note.title || 'Untitled'}
                                    </p>
                                </div>
                                {activeNoteId === note.id && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-zinc-500 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2. MIDDLE PANE: Notion-style Editor */}
            <div className="flex-1 flex flex-col lg:border-r border-white/5 relative min-w-0 bg-[#0E0E11]">
                {activeNote ? (
                    <>
                        {/* Editor Top Bar */}
                        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0E0E11]/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4 text-sm text-zinc-500">
                                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md text-zinc-400 font-medium">
                                    <AlignLeft className="w-3.5 h-3.5" /> Text Editor
                                </span>
                                {isSaving ? (
                                    <span className="flex items-center gap-1.5 text-zinc-400 animate-pulse">
                                        <Save className="w-3.5 h-3.5" /> Saving...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 text-zinc-500">
                                        <Clock className="w-3.5 h-3.5" /> Saved
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-md transition-all">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 md:px-16 lg:px-24 py-12">
                            <div className="max-w-3xl border-none mx-auto space-y-6">
                                <input
                                    type="text"
                                    className="w-full text-4xl font-bold bg-transparent border-none text-zinc-100 placeholder:text-zinc-700 focus:outline-none placeholder:font-bold"
                                    placeholder="Note Title"
                                    value={activeNote.title}
                                    onChange={(e) => updateActiveNote({ title: e.target.value })}
                                />
                                <div className="h-px w-16 bg-primary/30 my-6 rounded-full"></div>
                                <textarea
                                    className="w-full bg-transparent border-none resize-none text-zinc-300 focus:outline-none leading-[1.8] text-lg min-h-[500px] placeholder:text-zinc-700 font-medium"
                                    placeholder="Start writing..."
                                    value={activeNote.content}
                                    onChange={(e) => updateActiveNote({ content: e.target.value })}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <EmptyState
                            icon={<Layers className="w-10 h-10" />}
                            title="Workspace Empty"
                            description="Select a note from the sidebar or create a new one to start writing."
                        />
                    </div>
                )}
            </div>

            {/* 3. RIGHT PANE: AWS Bedrock AI Consensus Panel */}
            <div className="w-[400px] bg-[#141418] flex-col hidden xl:flex shrink-0">
                <div className="h-14 border-b border-white/5 px-4 flex items-center gap-2 text-zinc-200 bg-[#16161A]">
                    <BrainCircuit className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-sm tracking-wide">AI Consensus Engine</h3>
                </div>

                <div className="p-4 border-b border-white/5 bg-[#1A1A20] space-y-3 shadow-inner">
                    <p className="text-xs text-zinc-400 font-medium pb-1 uppercase tracking-widest">Execute AI Action</p>
                    <div className="relative">
                        <select
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            className="w-full appearance-none bg-[#0E0E11] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-300 focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                        >
                            <option value="Summarize this note">Summarize Note</option>
                            <option value="Generate 5 flashcards from this">Generate Flashcards</option>
                            <option value="Create a short quiz based on this material">Create Quiz</option>
                            <option value="Improve the writing and professionalism of this note">Improve Writing</option>
                            <option value="Extract action items and next steps">Extract Action Items</option>
                        </select>
                        <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none rotate-90" />
                    </div>
                    <button
                        onClick={handleAIAssist}
                        disabled={isStreaming || !activeNote?.content.trim()}
                        className="w-full py-2.5 px-4 bg-primary/10 hover:bg-primary/20 text-primary-light disabled:opacity-40 disabled:hover:bg-primary/10 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all border border-primary/20 hover:border-primary/40"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>{isStreaming ? 'Synthesizing...' : 'Execute'}</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gradient-to-b from-[#141418] to-[#0E0E11]">
                    {loading ? (
                        <div className="space-y-6">
                            <SkeletonLoader variant="text" className="w-1/2" />
                            <SkeletonLoader variant="card" className="h-[200px]" />
                        </div>
                    ) : error ? (
                        <ErrorBanner title="Engine Error" message={error} onRetry={handleAIAssist} />
                    ) : synthesized ? (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            {/* Consensus Verdict Status */}
                            <div className="bg-[#1A1A20] border border-white/5 rounded-xl p-4 shadow-xl">
                                <div className="flex flex-col gap-3">
                                    <VerificationBadge status={status as Exclude<typeof status, 'pending'>} />
                                    <ConsensusBar score={score ?? 0} />
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <ModelSources responses={responses} />
                                </div>
                            </div>

                            {/* Judged Final Output */}
                            <div className="bg-[#1A1A20] border border-white/5 rounded-xl overflow-hidden shadow-xl">
                                <div className="bg-primary/10 px-4 py-3 border-b border-primary/10 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-semibold text-primary-light tracking-wide">Judged Output</span>
                                </div>
                                <div className="prose prose-invert max-w-none text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap p-5">
                                    {synthesized}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center pb-12">
                            <div className="text-center space-y-4 max-w-[250px]">
                                <div className="w-16 h-16 bg-[#1A1A20] rounded-2xl flex items-center justify-center mx-auto border border-white/5 mb-6">
                                    <Bot className="w-8 h-8 text-primary" />
                                </div>
                                <h4 className="text-lg font-semibold text-zinc-200">AI Assistant</h4>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    Select an action above to run your note through the AWS Bedrock Multi-Model Consensus Engine.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
