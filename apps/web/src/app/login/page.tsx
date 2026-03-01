'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
    const { signInWithGoogle, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500" size={48} />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                        PocketMentor
                    </h1>
                    <p className="text-slate-400 mt-2">Sign in to continue your learning journey.</p>
                </div>

                <button
                    onClick={signInWithGoogle}
                    className="w-full bg-white text-slate-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-slate-200 transition-colors shadow-lg shadow-white/10"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                    <span>Sign in with Google</span>
                </button>

                <div className="mt-8 text-center text-xs text-slate-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>
        </div>
    );
}
