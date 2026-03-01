'use client';

import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, Send } from 'lucide-react';
import { apiFetch } from '@/lib/apiClient';

export default function CommunityPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPostContent, setNewPostContent] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await apiFetch('http://localhost:8000/api/v1/community/', {
                });
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.posts || []);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const handlePost = async () => {
        if (!newPostContent.trim() || isPosting) return;
        setIsPosting(true);
        try {
            const res = await apiFetch('http://localhost:8000/api/v1/community/', {
                method: 'POST',
                body: JSON.stringify({
                    title: newPostContent.slice(0, 50),
                    content: newPostContent
                })
            });
            if (res.ok) {
                setNewPostContent('');
                // Optimistic UI update or refetch
                const newPostData = await res.json();
                setPosts([{
                    id: newPostData.post_id,
                    author: 'You',
                    avatar: 'ME',
                    time: 'Just now',
                    content: newPostContent,
                    verification: { status: 'verified', score: 100 },
                    vote_count: 0
                }, ...posts]);
            }
        } catch (error) {
            console.error("Failed to post:", error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="flex h-[calc(100dvh-theme(spacing.16))] -m-4 md:-m-6 bg-background">
            {/* Left Sidebar - Trending/Topics */}
            <div className="hidden lg:block w-72 border-r border-border bg-surface/30 p-6 shrink-0 z-10 overflow-y-auto custom-scrollbar">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2.5 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                        <Users className="w-5 h-5 text-primary-light" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-100">Community</h1>
                        <p className="text-xs text-zinc-400">Verified discussions</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Trending Topics</h3>
                        <div className="space-y-2">
                            <span className="block px-3 py-2 rounded-lg bg-surfaceHover text-sm text-zinc-300 cursor-pointer border border-border"># React Architecture</span>
                            <span className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-300 hover:bg-surfaceHover cursor-pointer transition-colors"># System Design</span>
                            <span className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-300 hover:bg-surfaceHover cursor-pointer transition-colors"># Advanced Python</span>
                            <span className="block px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-300 hover:bg-surfaceHover cursor-pointer transition-colors"># Machine Learning</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Top Contributors</h3>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 font-medium text-xs flex items-center justify-center text-zinc-400">U{i}</div>
                                        <div className="text-sm text-zinc-300 font-medium">User {i}</div>
                                    </div>
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Feed */}
            <div className="flex-1 flex flex-col items-center overflow-y-auto p-4 md:p-8 custom-scrollbar">
                <div className="w-full max-w-2xl space-y-6">

                    {/* Create Post */}
                    <div className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="flex gap-3 md:gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 text-accent font-bold flex items-center justify-center shrink-0 shadow-sm">
                                ME
                            </div>
                            <div className="flex-1 min-w-0">
                                <textarea
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    placeholder="Share an insight or ask a question to the community..."
                                    className="w-full bg-transparent resize-none text-base md:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none min-h-[80px]"
                                />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-3 border-t border-border gap-3 sm:gap-0">
                                    <div className="text-xs text-zinc-500 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                                        <span>Your post will be AI-verified</span>
                                    </div>
                                    <button
                                        onClick={handlePost}
                                        disabled={isPosting || !newPostContent.trim()}
                                        className="w-full sm:w-auto px-6 py-2 bg-primary hover:bg-primary-hover disabled:bg-zinc-800 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors shadow-glow min-h-[44px]">
                                        <Send className="w-4 h-4" /> {isPosting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feed Posts */}
                    <div className="space-y-4 md:space-y-6 pb-24 md:pb-20">
                        {posts.map((post) => (
                            <div key={post.id} className="bg-surface border border-border rounded-2xl p-4 md:p-5 shadow-sm hover:border-zinc-700 transition-colors animate-slide-up relative">

                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 font-medium text-zinc-300 flex items-center justify-center shrink-0">
                                            {post.avatar}
                                        </div>
                                        <div>
                                            <h3 className="text-zinc-200 font-medium text-sm flex items-center gap-2">
                                                {post.author || "Anonymous"}
                                            </h3>
                                            <p className="text-xs text-zinc-500">
                                                {post.time || new Date(post.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="text-zinc-500 hover:text-zinc-300 p-2 -mr-2 flex items-center justify-center min-h-[44px] min-w-[44px]">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <p className="text-zinc-300 text-[15px] md:text-sm leading-relaxed mb-4">
                                    {post.content}
                                </p>

                                {/* Verification Badge / Insight */}
                                <div className={`mb-4 p-3 md:p-4 rounded-xl border flex gap-3 ${post.is_verified || post.verification?.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                                    }`}>
                                    <div className="mt-0.5 shrink-0">
                                        <Sparkles className={`w-4 h-4 md:w-5 md:h-5 ${post.is_verified || post.verification?.status === 'verified' ? 'text-emerald-400' : 'text-rose-400'}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${post.is_verified || post.verification?.status === 'verified' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {post.is_verified || post.verification?.status === 'verified' ? 'Consensus Verified' : 'Standard Post'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 sm:gap-6 pt-3 border-t border-border -mx-2 px-2">
                                    <button className="flex items-center justify-center gap-2 text-zinc-400 hover:text-rose-400 transition-colors group min-h-[44px] min-w-[60px] flex-1 sm:flex-none">
                                        <div className="p-2 inset-0 rounded-full group-hover:bg-rose-500/10">
                                            <Heart className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">{post.vote_count || post.likes || 0}</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 text-zinc-400 hover:text-blue-400 transition-colors group min-h-[44px] min-w-[60px] flex-1 sm:flex-none">
                                        <div className="p-2 inset-0 rounded-full group-hover:bg-blue-500/10">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <span className="text-sm font-medium">{post.comments || 0}</span>
                                    </button>
                                    <button className="flex items-center justify-center gap-2 text-zinc-400 hover:text-emerald-400 transition-colors group sm:ml-auto min-h-[44px] min-w-[44px] flex-1 sm:flex-none">
                                        <div className="p-2 inset-0 rounded-full group-hover:bg-emerald-500/10">
                                            <Share2 className="w-5 h-5" />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
