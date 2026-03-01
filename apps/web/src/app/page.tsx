'use client';

import { Smartphone, Monitor, Download, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function GatewayPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-6">
          Consensus Engine
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Verify reality. Cross-check AI responses with multi-model consensus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full relative z-10">
        {/* Mobile App Option */}
        <div className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 transition-all duration-300 cursor-pointer flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:text-purple-400 group-hover:scale-110 transition-all duration-300">
            <Smartphone size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Mobile App</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Offline-first learning. Download content and learn without internet. Perfect for on-the-go.
          </p>
          <button className="mt-auto flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
            <Download size={18} />
            <span>Download APK</span>
          </button>
        </div>

        {/* Web Portal Option */}
        <div
          onClick={() => router.push('/login')}
          className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 cursor-pointer flex flex-col items-center text-center relative"
        >
          <div className="absolute top-4 right-4 bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
            ONLINE
          </div>
          <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all duration-300">
            <Monitor size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Web Portal</h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed">
            Full dashboard access, PDF uploads, and detailed analytics. Optimized for desktop use.
          </p>
          <button className="mt-auto flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40">
            <span>Login to Portal</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <div className="mt-16 text-slate-600 text-sm">
        © 2024 Consensus Engine Inc.
      </div>
    </div>
  );
}
