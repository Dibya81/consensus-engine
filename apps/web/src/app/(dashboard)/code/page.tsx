'use client';

import React, { useState, useRef } from 'react';
import { Code, Play, CheckCircle, TerminalSquare, Sparkles, BookText, Copy, Check, MessageSquare } from 'lucide-react';
import { useConsensusStream } from '@/hooks/useConsensusStream';
import { apiFetch } from '@/lib/apiClient';
import Editor from '@monaco-editor/react';
import VerificationBadge from '@/components/verification/VerificationBadge';
import ConsensusBar from '@/components/verification/ConsensusBar';
import ConflictPanel from '@/components/verification/ConflictPanel';
import ModelSources from '@/components/verification/ModelSources';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import EmptyState from '@/components/common/EmptyState';
import ErrorBanner from '@/components/common/ErrorBanner';

const codeTemplates = {
    python: { filename: 'main.py', code: 'def hello_world():\n    print("Hello Consensus Engine!")' },
    java: { filename: 'Main.java', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Consensus Engine!");\n    }\n}' },
    c: { filename: 'main.c', code: '#include <stdio.h>\n\nint main() {\n    printf("Hello Consensus Engine!\\n");\n    return 0;\n}' }
};

type Language = 'python' | 'java' | 'c';

export default function CodePage() {
    const [language, setLanguage] = useState<Language>('python');
    const [code, setCode] = useState(codeTemplates.python.code);
    const { streamQuery, isStreaming, responses, synthesized, status, score, error, loading } = useConsensusStream();
    const [activeTab, setActiveTab] = useState<'review' | 'output' | 'reference'>('review');

    const [isExecuting, setIsExecuting] = useState(false);
    const [executionOutput, setExecutionOutput] = useState<{ output: string, exit_code: number, time_ms: number } | null>(null);
    const [copied, setCopied] = useState(false);
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const decorationsRef = useRef<any>(null);

    // Holographic Heat Strip simulation
    React.useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            if (synthesized) {
                // Determine a random problematic line to highlight
                const lines = code.split('\n').length;
                const targetLine = Math.min(2, lines);

                if (!decorationsRef.current) {
                    decorationsRef.current = editorRef.current.createDecorationsCollection([]);
                }

                decorationsRef.current.set([
                    {
                        range: new monacoRef.current.Range(targetLine, 1, targetLine, 1),
                        options: {
                            isWholeLine: true,
                            glyphMarginClassName: 'heat-strip-warning',
                            linesDecorationsClassName: 'heat-strip-warning',
                        }
                    }
                ]);
            } else if (decorationsRef.current) {
                decorationsRef.current.clear();
            }
        }
    }, [synthesized, code]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleEditorWillMount = (monaco: any) => {
        monaco.editor.defineTheme('dracula', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { background: '282a36' },
                { token: 'keyword', foreground: 'ff79c6', fontStyle: 'bold' },
                { token: 'string', foreground: 'f1fa8c' },
                { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
                { token: 'number', foreground: 'bd93f9' },
                { token: 'type', foreground: '8be9fd', fontStyle: 'italic' },
                { token: 'function', foreground: '50fa7b' },
                { token: 'variable', foreground: 'f8f8f2' }
            ],
            colors: {
                'editor.background': '#1e1e24',
                'editor.foreground': '#f8f8f2',
                'editorLineNumber.foreground': '#6272a4',
                'editor.selectionBackground': '#44475a',
                'editor.lineHighlightBackground': '#2a2d3e',
                'editorSuggestWidget.background': '#282a36',
                'editorSuggestWidget.border': '#44475a',
            }
        });
    };

    const handleEditorMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Add "Ask AI Context Menu Action"
        editor.addAction({
            id: 'ask-ai-line',
            label: 'Ask Consensus AI to review this line',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: async function (ed: any) {
                const position = ed.getPosition();
                const text = ed.getModel().getLineContent(position.lineNumber);
                const selection = ed.getSelection();
                const selectedText = ed.getModel().getValueInRange(selection);

                const queryContent = selectedText ? selectedText : text;

                setActiveTab('review');
                await streamQuery(`Review this specific code snippet I just selected:\n\`\`\`\n${queryContent}\n\`\`\`\n\nExplain potential bugs, architectural optimizations, or logic flaws here in the context of my file.`, 'http://localhost:8000/api/v1/code/review', '');
            }
        });
    };

    const handleReview = async () => {
        if (!code.trim() || isStreaming) return;
        setActiveTab('review');
        await streamQuery(code, 'http://localhost:8000/api/v1/code/review', '');
    };

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        setCode(codeTemplates[lang].code);
    };

    const handleExecute = async () => {
        if (!code.trim() || isExecuting) return;
        setIsExecuting(true);
        setActiveTab('output');
        setExecutionOutput(null);

        try {
            const res = await apiFetch('http://localhost:8000/api/v1/code/execute', {
                method: 'POST',
                body: JSON.stringify({ language, code })
            });
            const data = await res.json();
            setExecutionOutput({
                output: data.output || 'No output generated.',
                exit_code: data.exit_code,
                time_ms: data.time_ms
            });
        } catch (err: any) {
            setExecutionOutput({
                output: "Request failed: " + err.message,
                exit_code: 1,
                time_ms: 0
            });
        } finally {
            setIsExecuting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-background overflow-y-auto lg:overflow-hidden custom-scrollbar w-auto lg:w-full">

            {/* Left Pane - Editor */}
            <div className="w-full lg:w-1/2 flex flex-col border-b lg:border-b-0 lg:border-r border-border relative min-h-[50dvh] lg:min-h-0 shrink-0">
                {/* Editor Header */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between bg-[#1e1e24] gap-3 relative z-10">
                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
                        <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center border border-white/5 shadow-inner">
                            <Code className="w-4 h-4 text-emerald-400 shrink-0" />
                        </div>
                        <h2 className="text-sm font-bold text-zinc-200 truncate tracking-wide">{codeTemplates[language].filename}</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Language Toggle */}
                        <div className="px-2 py-0.5 rounded-lg text-xs font-semibold bg-surface text-zinc-300 border border-white/10 w-full sm:w-auto hover:border-white/20 transition-colors shadow-sm">
                            <select
                                value={language}
                                onChange={(e) => handleLanguageChange(e.target.value as Language)}
                                className="bg-transparent border-none appearance-none focus:outline-none cursor-pointer outline-none w-full py-1.5 sm:py-1 px-1"
                            >
                                <option value="python" className="bg-surface text-zinc-200">Python 3.12</option>
                                <option value="java" className="bg-surface text-zinc-200">Java 21</option>
                                <option value="c" className="bg-surface text-zinc-200">C (GCC)</option>
                            </select>
                        </div>

                        {/* Copy Code */}
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-lg bg-surface border border-white/10 hover:bg-surfaceHover hover:border-white/20 transition-all text-zinc-400 hover:text-zinc-200 active:scale-95 flex items-center justify-center shadow-sm"
                            title="Copy code"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Editor Body with Holographic Overlays */}
                <div className="flex-1 relative bg-[#1e1e24] flex flex-col min-h-[350px] lg:min-h-0 overflow-hidden group">

                    {/* Ghost Text Overlay */}
                    {!isStreaming && !isExecuting && (
                        <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-0 group-hover:opacity-30 transition-opacity duration-1000 select-none mix-blend-screen">
                            <div className="font-mono text-[10px] text-primary/80 blur-[0.5px] transform -rotate-12 scale-150 tracking-widest uppercase">
                                // Neural Sync Ready
                            </div>
                        </div>
                    )}

                    {/* Scanning Laser Overlay when Verifying */}
                    {isStreaming && (
                        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden mix-blend-screen">
                            <div className="w-full h-1 bg-primary shadow-[0_0_20px_rgba(168,85,247,1)] animate-scan-laser absolute top-0" />
                            <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                        </div>
                    )}

                    <Editor
                        height="100%"
                        language={language}
                        theme="dracula"
                        value={code}
                        beforeMount={handleEditorWillMount}
                        onMount={handleEditorMount}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            glyphMargin: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
                            padding: { top: 16, bottom: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            renderLineHighlight: "all",
                            lineHeight: 24,
                            fontLigatures: true,
                            contextmenu: true
                        }}
                    />
                </div>

                {/* Editor Footer / Action Bar */}
                <div className="p-4 border-t border-border bg-[#1e1e24] flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
                    <div className="text-[11px] text-zinc-500 font-mono tracking-wider hidden sm:flex items-center gap-2">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Hint: Select code & right click "Ask Consensus AI"
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleExecute}
                            disabled={isExecuting}
                            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-surface hover:bg-[#2a2d3e] disabled:opacity-50 border border-white/5 text-zinc-200 rounded-xl flex items-center justify-center gap-2 transition-all font-semibold text-xs tracking-wide shadow-sm"
                        >
                            <Play className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{isExecuting ? 'Running...' : 'RUN NATIVE'}</span>
                        </button>
                        <button
                            onClick={handleReview}
                            disabled={isStreaming}
                            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.5)] text-xs tracking-wide"
                        >
                            <CheckCircle className="w-3.5 h-3.5" strokeWidth={3} />
                            <span>{isStreaming ? 'VERIFYING...' : 'AI CONSENSUS'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Pane - Analysis, Output, Reference */}
            <div className="w-full lg:w-1/2 flex flex-col bg-surface/30 relative min-h-[50dvh] lg:min-h-0 shrink-0">
                {/* Right Pane Header Tabs */}
                <div className="flex border-b border-border bg-surface/50 px-2 overflow-x-auto custom-scrollbar">
                    <button
                        onClick={() => setActiveTab('review')}
                        className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'review'
                            ? 'border-primary text-primary-light'
                            : 'border-transparent text-zinc-400 hover:text-zinc-300'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Review
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'output'
                            ? 'border-primary text-primary-light'
                            : 'border-transparent text-zinc-400 hover:text-zinc-300'
                            }`}
                    >
                        <TerminalSquare className="w-4 h-4" />
                        Execution Output
                    </button>
                    <button
                        onClick={() => setActiveTab('reference')}
                        className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'reference'
                            ? 'border-primary text-primary-light'
                            : 'border-transparent text-zinc-400 hover:text-zinc-300'
                            }`}
                    >
                        <BookText className="w-4 h-4" />
                        Quick Reference
                    </button>
                </div>

                {/* Right Pane Body */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    {activeTab === 'review' && (
                        <>
                            {loading ? (
                                <div className="space-y-6">
                                    <SkeletonLoader variant="text" className="w-1/3" />
                                    <SkeletonLoader variant="card" />
                                    <SkeletonLoader variant="text" />
                                    <SkeletonLoader variant="text" />
                                </div>
                            ) : error ? (
                                <div className="preserve-3d float-card glitch-effect mb-4 z-50">
                                    <ErrorBanner title="Matrix Synchronization Failed" message={error} onRetry={handleReview} />
                                </div>
                            ) : synthesized ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
                                    {/* Verification Status Header */}
                                    <div className="bg-surface/80 border border-border rounded-xl p-4 shadow-lg backdrop-blur-sm space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <VerificationBadge status={status as Exclude<typeof status, 'pending'>} />
                                            <div className="w-full sm:w-48">
                                                <ConsensusBar score={score ?? 0} />
                                            </div>
                                        </div>
                                        <ModelSources responses={responses} />
                                    </div>

                                    {/* AI Review Content */}
                                    <div className="prose prose-invert max-w-none">
                                        <div className="text-[15px] md:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap p-4 md:p-5 bg-surface/50 rounded-xl border border-white/5">
                                            {synthesized}
                                        </div>

                                        {/* Superimposed Holographic View */}
                                        {responses && responses.length > 1 && (
                                            <div className="relative mt-6 p-5 bg-[#0a0a0f] border border-red-500/20 rounded-xl overflow-hidden preserve-3d">
                                                <div className="absolute inset-0 bg-red-500/5 glitch-effect opacity-20 pointer-events-none" />
                                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                                    Holographic Consensus Diff
                                                </h4>
                                                <div className="relative font-mono text-xs p-2 bg-black/50 rounded-lg overflow-hidden h-24">
                                                    {/* Conflicting Base (Glitching) */}
                                                    <div className="absolute inset-2 opacity-50 hologram-diff-conflict pointer-events-none select-none blur-[0.5px]">
                                                        {responses[1].content.substring(0, 500)}...
                                                    </div>
                                                    {/* Verified Match (Solid) */}
                                                    <div className="relative opacity-90 hologram-diff-match font-bold">
                                                        {responses[0].content.substring(0, 500)}...
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Conflicts Panel */}
                                    <ConflictPanel conflicts={[]} />
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center p-6 text-center">
                                    <EmptyState
                                        icon={<CheckCircle className="w-8 h-8 text-emerald-500/50" />}
                                        title="Ready for Code Review"
                                        description="Click 'AI Consensus Review' below the editor to analyze your code architecture, logic, and security across multiple verified AI models."
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'output' && (
                        <div className="h-full flex flex-col font-mono text-[13px] text-zinc-300 bg-[#1e1e24] shadow-inner rounded-xl border border-white/5 p-5 relative overflow-hidden">
                            <div className="text-zinc-500 mb-4 whitespace-normal break-all select-none font-bold">
                                <span className="text-emerald-500 mr-2">➜</span>
                                {language === 'python' ? 'python3 main.py' : language === 'java' ? 'javac Main.java && java Main' : 'gcc main.c -o main && ./main'}
                            </div>

                            {isExecuting ? (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-8 h-8 border-[3px] border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                        <span className="text-emerald-500/70 text-[10px] uppercase font-bold tracking-[0.2em] animate-pulse">Compiling Environment</span>
                                    </div>
                                </div>
                            ) : executionOutput ? (
                                <>
                                    <div className={`flex-1 overflow-y-auto whitespace-pre-wrap pb-4 custom-scrollbar leading-relaxed ${executionOutput.exit_code === 0 ? 'text-zinc-200' : 'text-rose-400 font-bold glitch-effect preserve-3d float-card'}`}>
                                        {executionOutput.exit_code !== 0 && <div className="text-rose-500 mb-2">[CRITICAL_SYS_FAULT_DETECTED]</div>}
                                        {executionOutput.output}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] tracking-wider font-bold select-none">
                                        <span className={executionOutput.exit_code === 0 ? 'text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded uppercase' : 'text-rose-500 bg-rose-500/10 px-2 py-1 rounded uppercase'}>
                                            EXIT CODE {executionOutput.exit_code}
                                        </span>
                                        <span className="text-zinc-500 flex items-center gap-2">
                                            <TerminalSquare className="w-3.5 h-3.5" />
                                            {executionOutput.time_ms}ms execution
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-zinc-600 text-xs">
                                    Click "RUN NATIVE" to execute shell
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reference' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 pb-8">
                            <h3 className="text-xl font-bold text-zinc-100 capitalize">{language} Reference</h3>

                            <div className="grid gap-4">
                                <div className="bg-surface/50 border border-border p-4 rounded-xl">
                                    <h4 className="text-sm font-semibold text-primary-light mb-2 uppercase tracking-wider">Overview</h4>
                                    <p className="text-[15px] md:text-sm text-zinc-300 leading-relaxed">
                                        {language === 'python' && "A high-level, interpreted programming language known for its readability. Excellent for web dev, data science, and AI."}
                                        {language === 'java' && "A class-based, object-oriented language designed to have as few implementation dependencies as possible (Write Once, Run Anywhere)."}
                                        {language === 'c' && "A general-purpose, procedural computer programming language supporting structured programming, lexical variable scope, and recursion."}
                                    </p>
                                </div>

                                <div className="bg-surface/50 border border-border p-4 rounded-xl">
                                    <h4 className="text-sm font-semibold text-primary-light mb-2 uppercase tracking-wider">Typical Use Cases</h4>
                                    <ul className="list-disc list-inside text-[15px] md:text-sm text-zinc-300 space-y-1.5 md:space-y-1 ml-1">
                                        {language === 'python' && (
                                            <>
                                                <li>Machine Learning & AI</li>
                                                <li>Backend APIs (FastAPI, Django)</li>
                                                <li>Automation and Scripting</li>
                                            </>
                                        )}
                                        {language === 'java' && (
                                            <>
                                                <li>Enterprise Software</li>
                                                <li>Android App Development</li>
                                                <li>Large-scale distributed systems</li>
                                            </>
                                        )}
                                        {language === 'c' && (
                                            <>
                                                <li>Operating Systems</li>
                                                <li>Embedded Systems</li>
                                                <li>High-performance computation</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div className="bg-[#0d1117] border border-border p-4 rounded-xl font-mono text-sm text-emerald-300 overflow-x-auto custom-scrollbar">
                                    <h4 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider font-sans">Basic Syntax Example</h4>
                                    <pre className="whitespace-pre-wrap">{codeTemplates[language].code}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
