import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type VerificationStatus = 'verified' | 'partial' | 'conflicted' | 'single_source' | 'pending';

interface VerificationBadgeProps {
    status: VerificationStatus;
    score?: number;
    className?: string;
}

export function VerificationBadge({ status, score, className = '' }: VerificationBadgeProps) {
    const config = {
        verified: {
            icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            text: 'Verified Answer',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            textColor: 'text-emerald-400'
        },
        partial: {
            icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
            text: 'Partial Consensus',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            textColor: 'text-amber-400'
        },
        conflicted: {
            icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
            text: 'Conflicted',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            textColor: 'text-rose-400'
        },
        single_source: {
            icon: <Info className="w-4 h-4 text-blue-500" />,
            text: 'Unverified (Single Source)',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            textColor: 'text-blue-400'
        },
        pending: {
            icon: <div className="w-4 h-4 rounded-full border-2 border-slate-400 border-t-slate-200 animate-spin" />,
            text: 'Verifying...',
            bg: 'bg-slate-800',
            border: 'border-slate-700',
            textColor: 'text-slate-300'
        }
    };

    const style = config[status];

    return (
        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${style.bg} ${style.border} ${className}`}>
            {style.icon}
            <span className={`text-xs font-semibold ${style.textColor}`}>
                {style.text} {score !== undefined && `(${Math.round(score * 100)}%)`}
            </span>
        </div>
    );
}
