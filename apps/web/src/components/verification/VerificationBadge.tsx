import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, User } from 'lucide-react';

export type VerificationStatus = 'verified' | 'partial' | 'conflicted' | 'single_source';

interface VerificationBadgeProps {
    status: VerificationStatus;
    score?: number;
    className?: string;
}

export default function VerificationBadge({ status, score, className = '' }: VerificationBadgeProps) {
    const config = {
        verified: {
            color: 'text-status-verified bg-status-verified/10 border-status-verified/20',
            icon: ShieldCheck,
            label: 'Consensus Verified',
        },
        partial: {
            color: 'text-status-partial bg-status-partial/10 border-status-partial/20',
            icon: AlertTriangle,
            label: 'Partial Agreement',
        },
        conflicted: {
            color: 'text-status-conflicted bg-status-conflicted/10 border-status-conflicted/20',
            icon: ShieldAlert,
            label: 'Conflicted Answers',
        },
        single_source: {
            color: 'text-status-single bg-status-single/10 border-status-single/20',
            icon: User,
            label: 'Single Source',
        },
    };

    const { color, icon: Icon, label } = config[status];

    return (
        <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${color} ${className}`}>
            <Icon size={14} />
            <span>{label}</span>
            {score !== undefined && (
                <span className="ml-1 pl-1.5 border-l border-current opacity-70">
                    {Math.round(score * 100)}%
                </span>
            )}
        </div>
    );
}
