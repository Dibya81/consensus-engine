import React from 'react';

interface ConsensusBarProps {
    score: number; // 0.0 to 1.0
    className?: string;
}

export default function ConsensusBar({ score, className = '' }: ConsensusBarProps) {
    const percentage = Math.max(0, Math.min(100, Math.round(score * 100)));

    // Determine color based on score thresholds
    let colorClass = 'bg-status-conflicted';
    if (percentage >= 70) colorClass = 'bg-status-verified shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    else if (percentage >= 40) colorClass = 'bg-status-partial';

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between items-center mb-1 text-xs font-medium text-zinc-400">
                <span>Consensus Agreement</span>
                <span className={percentage >= 70 ? 'text-status-verified' : ''}>{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-surfaceHover rounded-full overflow-hidden">
                <div
                    className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
