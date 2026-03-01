import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ConflictPanelProps {
    conflicts: Array<{ area: string; perspectives: Array<{ model_name: string; viewpoint: string }> }>;
}

export function ConflictPanel({ conflicts }: ConflictPanelProps) {
    const [expanded, setExpanded] = React.useState(false);

    if (!conflicts || conflicts.length === 0) return null;

    return (
        <div className="mt-4 border border-rose-500/20 rounded-xl overflow-hidden bg-slate-900/50">
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
            >
                <span className="text-sm font-semibold text-rose-400">
                    View Conflicting Perspectives ({conflicts.length})
                </span>
                {expanded ? (
                    <ChevronUp className="w-4 h-4 text-rose-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-rose-400" />
                )}
            </button>

            {expanded && (
                <div className="p-4 space-y-4">
                    {conflicts.map((conflict, idx) => (
                        <div key={idx} className="space-y-2">
                            <h4 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-1">
                                Issue: {conflict.area}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {conflict.perspectives.map((p, pIdx) => (
                                    <div key={pIdx} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                        <div className="text-xs text-slate-400 mb-1">{p.model_name} says:</div>
                                        <div className="text-sm text-slate-200">{p.viewpoint}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
