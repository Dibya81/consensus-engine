import React from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';

interface ErrorBannerProps {
    title: string;
    message: string;
    isOffline?: boolean;
    onRetry?: () => void;
}

export default function ErrorBanner({ title, message, isOffline = false, onRetry }: ErrorBannerProps) {
    return (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start space-x-3 text-red-400">
            <div className="flex-shrink-0 mt-0.5">
                {isOffline ? <WifiOff size={20} /> : <AlertTriangle size={20} />}
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-sm mt-1 opacity-80">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex-shrink-0 text-sm font-medium px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    );
}
