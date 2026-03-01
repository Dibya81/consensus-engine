import React from 'react';
import Link from 'next/link';

interface CourseCardProps {
    title: string;
    description?: string;
    progress?: number;
    href?: string;
    color?: string;
}

export default function CourseCard({ title, description, progress, href = '#', color = 'bg-purple-500' }: CourseCardProps) {
    return (
        <Link href={href} className="block w-full">
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors shadow-lg group">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">{title}</h3>
                </div>

                {description && (
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">{description}</p>
                )}

                {progress !== undefined && (
                    <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full ${color} rounded-full transition-all duration-500`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
}
