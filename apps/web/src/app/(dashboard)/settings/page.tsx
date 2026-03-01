'use client';

import React, { useState } from 'react';
import { Settings, User, Bell, Shield, Database, Palette, Globe, Mic, Key, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', icon: <User className="w-4 h-4" />, label: 'Profile Information' },
        { id: 'appearance', icon: <Palette className="w-4 h-4" />, label: 'Appearance & Theme' },
        { id: 'preferences', icon: <Globe className="w-4 h-4" />, label: 'Language & Voice' },
        { id: 'api', icon: <Key className="w-4 h-4" />, label: 'Model API Keys' },
        { id: 'security', icon: <Shield className="w-4 h-4" />, label: 'Privacy & Security' },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-background overflow-y-auto md:overflow-hidden w-[calc(100%+2rem)] md:w-full custom-scrollbar">

            {/* Left Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-surface/30 p-4 md:p-6 md:overflow-y-auto custom-scrollbar flex flex-col shrink-0 min-h-[300px] md:min-h-0">
                <div className="flex items-center space-x-3 mb-6 md:mb-8">
                    <div className="p-2 md:p-2.5 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Settings className="w-4 h-4 md:w-5 md:h-5 text-primary-light" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-xl font-bold text-zinc-100">Settings</h1>
                        <p className="text-[11px] md:text-xs text-zinc-400">Preferences</p>
                    </div>
                </div>

                <div className="space-y-1 flex-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all text-[13px] md:text-sm font-medium ${activeTab === tab.id
                                ? 'bg-zinc-800 text-primary-light shadow border border-border'
                                : 'text-zinc-400 hover:bg-surfaceHover hover:text-zinc-200 border border-transparent'
                                } min-h-[44px]`}
                        >
                            <div className={activeTab === tab.id ? 'text-primary' : 'text-zinc-500 shrink-0'}>
                                {tab.icon}
                            </div>
                            <span className="truncate">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="mt-4 md:mt-auto pt-4 md:pt-6 border-t border-border">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-colors text-[13px] md:text-sm font-medium min-h-[44px]"
                    >
                        <LogOut className="w-4 h-4 shrink-0" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-6 lg:p-10 md:overflow-y-auto custom-scrollbar bg-surface/10 shrink-0 min-h-[50dvh] md:min-h-0 pb-12 md:pb-10">
                <div className="max-w-3xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 mx-auto">

                    {activeTab === 'profile' && (
                        <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
                            <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-4 md:mb-6 flex items-center gap-2">
                                <User className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Profile Information
                            </h2>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 gap-4 sm:gap-0 mb-6 md:mb-8 pt-4 border-t border-border">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-blue-500 rounded-full flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] border-4 border-background shrink-0">
                                    {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="space-y-2 text-center sm:text-left w-full sm:w-auto mt-2 sm:mt-0">
                                    <button className="w-full sm:w-auto px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-[13px] md:text-sm font-medium border border-border min-h-[44px]">
                                        Upload Avatar
                                    </button>
                                    <p className="text-[11px] md:text-xs text-zinc-500">JPG, GIF or PNG. Max size 2MB.</p>
                                </div>
                            </div>

                            <div className="space-y-4 md:space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                    <div>
                                        <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 md:mb-2">Display Name</label>
                                        <input type="text" defaultValue={user?.displayName || ''} className="w-full bg-[#0d1117] border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-zinc-200 focus:outline-none focus:border-primary transition-colors text-base md:text-sm min-h-[44px]" />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 md:mb-2">Email Address</label>
                                        <input type="email" defaultValue={user?.email || ''} disabled className="w-full bg-background border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-zinc-500 cursor-not-allowed text-base md:text-sm min-h-[44px]" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 md:pt-8 mt-6 md:mt-8 border-t border-border flex justify-end">
                                <button className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-[13px] md:text-sm font-semibold transition-colors shadow-glow min-h-[44px]">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
                            <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-4 md:mb-6 flex items-center gap-2">
                                <Palette className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Appearance & Theme
                            </h2>
                            <div className="pt-4 border-t border-border space-y-5 md:space-y-6">
                                <div>
                                    <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3 md:mb-4">Color Theme</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                                        <button className="border-2 border-primary bg-background rounded-xl p-3 md:p-4 flex sm:flex-col items-center gap-3 sm:gap-2 group text-left sm:text-center min-h-[44px]">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-950 border border-border shadow-sm group-hover:scale-105 transition-transform shrink-0" />
                                            <span className="text-[13px] md:text-sm font-medium text-primary-light">Dark (Default)</span>
                                        </button>
                                        <button className="border border-border bg-surface rounded-xl p-3 md:p-4 flex sm:flex-col items-center gap-3 sm:gap-2 hover:border-zinc-500 transition-colors opacity-50 cursor-not-allowed text-left sm:text-center min-h-[44px]">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-border shadow-sm shrink-0" />
                                            <span className="text-[13px] md:text-sm font-medium text-zinc-400">Light (Coming Soon)</span>
                                        </button>
                                        <button className="border border-border bg-surface rounded-xl p-3 md:p-4 flex sm:flex-col items-center gap-3 sm:gap-2 hover:border-zinc-500 transition-colors opacity-50 cursor-not-allowed text-left sm:text-center min-h-[44px]">
                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-zinc-900 to-white border border-border shadow-sm shrink-0" />
                                            <span className="text-[13px] md:text-sm font-medium text-zinc-400">System Sync</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="pt-4 md:pt-6">
                                    <label className="flex items-center justify-between p-3 md:p-4 border border-border rounded-xl bg-[#0d1117] cursor-pointer hover:border-zinc-700 transition-colors min-h-[44px]">
                                        <div className="pr-4">
                                            <div className="text-[13px] md:text-sm font-medium text-zinc-200">Reduce Animations</div>
                                            <div className="text-[11px] md:text-xs text-zinc-500 mt-0.5 md:mt-1">Minimize UI motion for better performance.</div>
                                        </div>
                                        <div className="w-10 md:w-11 h-5 md:h-6 bg-zinc-800 rounded-full relative shrink-0">
                                            <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-zinc-400 rounded-full absolute left-1 top-1" />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
                            <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-4 md:mb-6 flex items-center gap-2">
                                <Globe className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Language & Voice Options
                            </h2>
                            <div className="pt-4 border-t border-border space-y-5 md:space-y-6">
                                <div>
                                    <label className="block text-[11px] md:text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 md:mb-2">Display Language</label>
                                    <select className="w-full bg-[#0d1117] border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-zinc-200 focus:outline-none focus:border-primary transition-colors text-base md:text-sm appearance-none min-h-[44px]">
                                        <option>English (US)</option>
                                        <option>Spanish</option>
                                        <option>Hindi (भारत)</option>
                                    </select>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <h3 className="text-[13px] md:text-sm font-medium text-zinc-200 mb-3 md:mb-4 flex items-center gap-2">
                                        <Mic className="w-4 h-4 text-zinc-400" /> Voice Assistant Settings
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                        <button className="border border-primary bg-primary/5 rounded-xl p-3 md:p-4 flex items-center gap-3 text-left min-h-[44px]">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">A</div>
                                            <div>
                                                <div className="text-[13px] md:text-sm font-medium text-primary-light">Nova (Female)</div>
                                                <div className="text-[11px] md:text-xs text-primary/60">Professional</div>
                                            </div>
                                        </button>
                                        <button className="border border-border bg-surface rounded-xl p-3 md:p-4 flex items-center gap-3 text-left hover:border-zinc-600 transition-colors min-h-[44px]">
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold text-xs shrink-0">B</div>
                                            <div>
                                                <div className="text-[13px] md:text-sm font-medium text-zinc-300">Echo (Male)</div>
                                                <div className="text-[11px] md:text-xs text-zinc-500">Casual</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
                            <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-4 md:mb-6 flex items-center gap-2">
                                <Key className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Model API Keys
                            </h2>
                            <p className="text-[13px] md:text-sm text-zinc-400 mb-5 md:mb-6 pb-5 md:pb-6 border-b border-border">
                                The Consensus Engine processes queries through multiple models. You can provide your own API keys for external models here to bypass the free tier rate limits.
                            </p>

                            <div className="space-y-5 md:space-y-6">
                                <div>
                                    <label className="flex items-center justify-between text-[13px] md:text-sm font-medium text-zinc-300 mb-1.5 md:mb-2">
                                        <span>OpenAI API Key (GPT-4)</span>
                                        <span className="text-[10px] md:text-xs text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                                    </label>
                                    <input type="password" value="sk-••••••••••••••••••••••••••••••" readOnly className="w-full bg-[#0d1117] border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-zinc-500 font-mono text-base md:text-sm min-h-[44px]" />
                                </div>
                                <div>
                                    <label className="flex items-center justify-between text-[13px] md:text-sm font-medium text-zinc-300 mb-1.5 md:mb-2">
                                        <span>Google Gemini API Key</span>
                                        <span className="text-[11px] md:text-xs text-zinc-500">Not configured</span>
                                    </label>
                                    <input type="password" placeholder="Enter Gemini key..." className="w-full bg-[#0d1117] border border-border rounded-xl px-3 md:px-4 py-2.5 md:py-3 text-zinc-200 focus:outline-none focus:border-primary transition-colors font-mono text-base md:text-sm min-h-[44px]" />
                                </div>
                                <div className="pt-4 md:pt-6">
                                    <button className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[13px] md:text-sm font-semibold transition-colors border border-border min-h-[44px]">
                                        Update Keys
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-surface border border-border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
                            <h2 className="text-lg md:text-xl font-bold text-zinc-100 mb-4 md:mb-6 flex items-center gap-2">
                                <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" /> Privacy & Security
                            </h2>
                            <div className="space-y-3 md:space-y-4 pt-4 border-t border-border">
                                <div className="flex items-center justify-between p-3 md:p-4 bg-[#0d1117] border border-border rounded-xl min-h-[44px]">
                                    <div className="pr-4">
                                        <div className="text-[13px] md:text-sm font-medium text-zinc-200">Telemetry Data</div>
                                        <div className="text-[11px] md:text-xs text-zinc-500 mt-0.5 md:mt-1">Send anonymous usage data to improve the engine.</div>
                                    </div>
                                    <div className="w-10 md:w-11 h-5 md:h-6 bg-primary rounded-full relative cursor-pointer shrink-0">
                                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 md:p-4 bg-[#0d1117] border border-border rounded-xl min-h-[44px]">
                                    <div className="pr-4">
                                        <div className="text-[13px] md:text-sm font-medium text-zinc-200">Local History Storage</div>
                                        <div className="text-[11px] md:text-xs text-zinc-500 mt-0.5 md:mt-1">Keep copies of AI summaries on your device.</div>
                                    </div>
                                    <div className="w-10 md:w-11 h-5 md:h-6 bg-primary rounded-full relative cursor-pointer shrink-0">
                                        <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
