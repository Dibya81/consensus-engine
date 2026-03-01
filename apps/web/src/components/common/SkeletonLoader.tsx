import React from 'react';

export default function SkeletonLoader({ className = '', variant = 'text' }: { className?: string, variant?: 'text' | 'card' | 'circle' }) {
    const baseClass = "animate-pulse bg-surfaceHover rounded";

    if (variant === 'circle') {
        return <div className={`${baseClass} rounded-full ${className}`} />;
    }

    if (variant === 'card') {
        return (
            <div className={`p-4 border border-border rounded-lg bg-surface space-y-3 ${className}`}>
                <div className={`${baseClass} h-4 w-1/3 rounded-md`} />
                <div className={`${baseClass} h-20 w-full rounded-md`} />
                <div className="flex space-x-2">
                    <div className={`${baseClass} h-4 w-16 rounded-md`} />
                    <div className={`${baseClass} h-4 w-16 rounded-md`} />
                </div>
            </div>
        );
    }

    return <div className={`${baseClass} h-4 w-full ${className}`} />;
}
