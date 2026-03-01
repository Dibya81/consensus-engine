import React from 'react';
import { FileSearch } from 'lucide-react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-border rounded-xl bg-surface/50">
            <div className="w-16 h-16 bg-surfaceHover rounded-full flex items-center justify-center text-zinc-500 mb-4 shadow-glass">
                {icon || <FileSearch size={32} />}
            </div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-2">{title}</h3>
            <p className="text-zinc-400 max-w-sm mb-6 text-sm">{description}</p>
            {action && <div>{action}</div>}
        </div>
    );
}
