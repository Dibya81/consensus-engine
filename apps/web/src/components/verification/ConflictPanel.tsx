import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Conflict {
    area: string;
    perspectives: {
        model_name: string;
        viewpoint: string;
        reasoning: string;
    }[];
}

interface ConflictPanelProps {
    conflicts: Conflict[];
}

export default function ConflictPanel({ conflicts }: ConflictPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!conflicts || conflicts.length === 0) return null;

    return (
        <div className="mt-4 border border-status-conflicted/30 rounded-lg overflow-hidden bg-surface">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 bg-status-conflicted/5 hover:bg-status-conflicted/10 transition-colors"
            >
                <div className="flex items-center space-x-2 text-status-conflicted">
                    <AlertCircle size={18} />
                    <span className="font-semibold text-sm">
                        {conflicts.length} Point{conflicts.length > 1 ? 's' : ''} of Dispute Detected
                    </span>
                </div>
                {isExpanded ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
            </button>

            {isExpanded && (
                <div className="divide-y divide-border">
                    {conflicts.map((conflict, idx) => (
                        <div key={idx} className="p-4">
                            <h4 className="text-sm font-medium text-zinc-200 mb-3 flex items-center">
                                <span className="bg-surfaceHover px-2 py-1 rounded text-xs text-zinc-400 mr-2 border border-border">Topic</span>
                                {conflict.area}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {conflict.perspectives.map((p, pIdx) => (
                                    <div key={pIdx} className="bg-surfaceHover rounded-md p-3 border border-border">
                                        <div className="text-xs font-semibold text-primary-light mb-1">{p.model_name}</div>
                                        <div className="text-sm text-zinc-300 mb-2">{p.viewpoint}</div>
                                        <div className="text-xs text-zinc-500 border-t border-border/50 pt-2">
                                            <span className="font-medium">Reasoning:</span> {p.reasoning}
                                        </div>
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
