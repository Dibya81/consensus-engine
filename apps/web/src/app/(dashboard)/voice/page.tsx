'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Radio, Sparkles, CheckCircle, Shield } from 'lucide-react';
import { useConsensusStream } from '@/hooks/useConsensusStream';
import { useAuth } from '@/context/AuthContext';
import VerificationBadge from '@/components/verification/VerificationBadge';
import ConsensusBar from '@/components/verification/ConsensusBar';

export default function VoicePage() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const { token } = useAuth();
    const { streamQuery, isStreaming, synthesized, status, error, score } = useConsensusStream();

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

            // Auto-stop simulation after 5 seconds just for demo purposes
            if (recordingTime === 5) {
                setIsRecording(false);
                setTranscript("Can you explain how the multi-agent consensus verification works under the hood?");
            }
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording, recordingTime]);

    const handleProcess = async () => {
        if (!transcript || isStreaming || !token) return;
        await streamQuery(transcript, 'http://localhost:8000/api/v1/voice/process', token);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-background items-start md:items-center justify-center p-4 md:p-6 overflow-y-auto custom-scrollbar">

            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 min-h-min py-4 md:py-0">

                {/* Left: Input / Recording Area */}
                <div className="bg-surface border border-border rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-sm h-[400px] md:h-[500px]">
                    <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-rose-500/5 rounded-full blur-3xl -mr-16 md:-mr-20 -mt-16 md:-mt-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-primary/5 rounded-full blur-3xl -ml-16 md:-ml-20 -mb-16 md:-mb-20 pointer-events-none" />

                    <div className="text-center mb-6 md:mb-10 relative z-10">
                        <div className="inline-flex items-center justify-center p-2.5 md:p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 mb-3 md:mb-4 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                            <Radio className="w-6 h-6 md:w-8 md:h-8 text-rose-400" />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-zinc-100">Voice Interaction</h1>
                        <p className="text-zinc-400 text-[13px] md:text-sm mt-1 md:mt-2">Speak directly to the Consensus Engine.</p>
                    </div>

                    {/* Recording Button and Waves */}
                    <div className="relative flex flex-col items-center justify-center mb-6 md:mb-10 z-10 w-full">

                        {/* Audio Waves Mock */}
                        {isRecording && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-50 pointer-events-none -m-10">
                                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-rose-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                                <div className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full border border-rose-500/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                            </div>
                        )}

                        <button
                            onClick={() => setIsRecording(!isRecording)}
                            disabled={isStreaming}
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all z-20 shadow-lg ${isRecording
                                ? 'bg-rose-500 text-white hover:bg-rose-600 hover:scale-105 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
                                : 'bg-surfaceHover border border-border text-zinc-300 hover:bg-zinc-800 hover:scale-105 hover:text-white'
                                } disabled:opacity-50 disabled:hover:scale-100 min-h-[44px] min-w-[44px]`}
                        >
                            {isRecording ? <Square className="w-6 h-6 md:w-8 md:h-8 fill-current" /> : <Mic className="w-6 h-6 md:w-8 md:h-8" />}
                        </button>
                    </div>

                    <div className="flex flex-col items-center z-10 space-y-1 md:space-y-2">
                        <div className={`font-mono text-lg md:text-xl tracking-wider ${isRecording ? 'text-rose-400 flex items-center gap-2' : 'text-zinc-500'}`}>
                            {isRecording && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-500 animate-pulse" />}
                            {formatTime(recordingTime)}
                        </div>
                        <p className="text-[13px] md:text-sm text-zinc-500">
                            {isRecording ? 'Listening carefully...' : 'Tap mic to start recording'}
                        </p>
                    </div>
                </div>

                {/* Right: Transcript and Analysis Output */}
                <div className="bg-surface/50 border border-border rounded-[2rem] p-5 md:p-6 flex flex-col h-[400px] md:h-[500px]">

                    {/* Transcript Box */}
                    <div className={`transition-all duration-500 ${transcript ? 'opacity-100 mb-4 md:mb-6 flex-shrink-0' : 'opacity-50 flex-1 flex flex-col items-center justify-center text-center'}`}>
                        {transcript ? (
                            <div className="bg-[#0d1117] border border-border rounded-xl md:rounded-2xl p-4 md:p-5 relative overflow-hidden">
                                <span className="absolute top-0 right-0 px-2 py-0.5 md:py-1 bg-zinc-800 rounded-bl-lg border-l border-b border-border text-[9px] md:text-[10px] font-bold tracking-widest uppercase text-zinc-500">Transcript</span>
                                <p className="text-zinc-300 text-[13px] md:text-sm leading-relaxed pt-2 md:pt-2">{transcript}</p>

                                <button
                                    onClick={handleProcess}
                                    disabled={isStreaming}
                                    className="mt-3 md:mt-4 w-full px-4 py-2 md:py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 transition-all text-sm font-semibold shadow-glow min-h-[44px]"
                                >
                                    {isStreaming ? (
                                        <>
                                            <div className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Analyzing Consensus...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" /> Process with AI
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3 md:space-y-4 max-w-[160px] md:max-w-[200px] mx-auto text-zinc-500">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-background rounded-full border border-border mx-auto flex items-center justify-center shadow-sm">
                                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-zinc-600" />
                                </div>
                                <p className="text-xs md:text-sm leading-relaxed">Your spoken queries and their AI-verified answers will appear here.</p>
                            </div>
                        )}
                    </div>

                    {/* Output Box */}
                    {transcript && (
                        <div className="flex-1 bg-background border border-border rounded-xl md:rounded-2xl p-4 md:p-5 overflow-y-auto custom-scrollbar relative">
                            {isStreaming ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4">
                                    <div className="flex space-x-1 items-end h-16">
                                        <div className="w-1 md:w-1.5 h-6 bg-primary/40 rounded-full animate-wave" style={{ animationDelay: '0s' }} />
                                        <div className="w-1 md:w-1.5 h-10 bg-primary/60 rounded-full animate-wave" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-1 md:w-1.5 h-14 bg-primary/80 rounded-full animate-wave" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-1 md:w-1.5 h-10 bg-primary/60 rounded-full animate-wave" style={{ animationDelay: '0.3s' }} />
                                        <div className="w-1 md:w-1.5 h-6 bg-primary/40 rounded-full animate-wave" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                    <p className="text-[13px] md:text-sm text-zinc-500">Synthesizing multi-model response...</p>
                                </div>
                            ) : synthesized ? (
                                <div className="space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <VerificationBadge status={status as any} />
                                        {score !== undefined && (
                                            <div className="w-full sm:w-48">
                                                <ConsensusBar score={score} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="prose prose-sm md:prose-base prose-invert prose-emerald text-[13px] md:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                                        {synthesized}
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="text-rose-400 p-3 md:p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs md:text-sm flex gap-2 md:gap-3 items-start">
                                    <Shield className="w-4 h-4 md:w-5 md:h-5 shrink-0 mt-0.5" />
                                    <span className="break-words">{error}</span>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-[13px] md:text-sm text-zinc-500 flex-col gap-1.5 md:gap-2">
                                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-zinc-600" />
                                    Ready to process transcript
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
