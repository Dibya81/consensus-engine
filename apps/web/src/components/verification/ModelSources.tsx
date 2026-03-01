import React from 'react';
import { Cpu, Bot, Sparkles } from 'lucide-react';

interface ModelSourcesProps {
    responses: {
        provider: string;
        model_name: string;
        latency_ms?: number;
    }[];
}

export default function ModelSources({ responses }: ModelSourcesProps) {
    if (!responses || responses.length === 0) return null;

    // Helper to map providers to icons/colors
    const getProviderVisuals = (provider: string) => {
        const p = provider.toLowerCase();
        if (p.includes('google') || p.includes('gemini')) {
            return { icon: Sparkles, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' };
        }
        if (p.includes('openai') || p.includes('gpt')) {
            return { icon: Cpu, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' };
        }
        if (p.includes('anthropic') || p.includes('claude')) {
            return { icon: Bot, color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' };
        }
        // Default
        return { icon: Bot, color: 'text-zinc-400', bg: 'bg-zinc-800 border-zinc-700' };
    };

    return (
        <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-zinc-500 flex items-center mr-1">Sources:</span>
            {responses.map((res, idx) => {
                const visuals = getProviderVisuals(res.provider);
                const Icon = visuals.icon;

                return (
                    <div
                        key={idx}
                        className={`flex items-center space-x-1.5 px-2 py-1 rounded text-[10px] font-medium border ${visuals.bg} ${visuals.color}`}
                        title={`${res.model_name} (${res.latency_ms ? res.latency_ms + 'ms' : 'Unknown latency'})`}
                    >
                        <Icon size={12} />
                        <span>{res.provider}</span>
                    </div>
                );
            })}
        </div>
    );
}
