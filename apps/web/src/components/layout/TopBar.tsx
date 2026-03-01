'use client';

import React from 'react';
import { Search, Bell, Mic, User, Menu } from 'lucide-react';

interface TopBarProps {
    onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    return (
        <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">

            <div className="flex items-center gap-3">
                {/* Mobile Hamburger Menu */}
                {onMenuClick && (
                    <button
                        onClick={onMenuClick}
                        className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-zinc-100 hover:bg-surfaceHover rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                )}

                {/* Logo area (visible on mobile alongside hamburger) */}
                <div className="flex items-center md:hidden">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Consensus
                    </h2>
                </div>
            </div>

            {/* Quick Ask / Search Bar (Hidden on Mobile) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Quick Ask: e.g. 'Explain promises in JS'..."
                        className="w-full pl-10 pr-4 py-2 bg-surfaceHover border border-border rounded-full text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                        <kbd className="hidden sm:inline-flex items-center justify-center px-2 py-0.5 text-xs font-mono font-medium bg-surface text-zinc-400 border border-border rounded-md">
                            ⌘K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 md:space-x-3 ml-auto">
                <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-surfaceHover rounded-full transition-colors relative min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 md:top-1.5 md:right-1.5 h-2 w-2 bg-accent rounded-full border border-background"></span>
                </button>
                <button className="p-2 text-primary hover:text-primary-light hover:bg-primary/10 rounded-full transition-colors block min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Mic className="h-5 w-5" />
                </button>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent p-[2px] cursor-pointer ml-1 md:ml-2">
                    <div className="h-full w-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                        <User className="h-5 w-5 text-zinc-400" />
                    </div>
                </div>
            </div>
        </header>
    );
}
