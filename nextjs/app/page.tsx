'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col max-w-7xl mx-auto font-sans">
      
      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center py-16 md:py-24 min-h-[75vh] max-w-4xl mx-auto">
        {/* Pulsing Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
          Built on Pharos Testnet
        </div>
        
        {/* Big Bold Headline */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-white mb-8 uppercase select-none">
          REMEMBER EVERY<br />
          DECISION.<br />
          VERIFY NOTHING<br />
          BLIND.
        </h1>
        
        {/* Subtitle */}
        <p className="text-sm md:text-lg text-gray-400 mb-10 leading-relaxed max-w-2xl font-medium">
          The first persistent memory layer for AI Agents on Pharos.<br className="hidden md:inline" />
          Store decisions, recall context, and prove integrity — cryptographically.
        </p>
        
        {/* Three Pill Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <span className="badge-pill px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
            No Mock Data
          </span>
          <span className="badge-pill px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
            On-Chain Proof
          </span>
          <span className="badge-pill px-5 py-2 rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
            Semantic Recall
          </span>
        </div>

        {/* Launch App CTA Button */}
        <Link 
          href="/dashboard"
          className="btn-purple px-8 py-4 rounded-lg text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all transform hover:scale-[1.02] shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
        >
          <span>Launch App</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* THREE FEATURE CARDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        
        {/* CARD 1 */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[220px] hover:border-purple-500/30 transition-all group">
          <div>
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">🧠</div>
            <h3 className="text-base font-black tracking-wider text-white uppercase mb-2">
              Persistent Memory
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-mono">
              Agents remember decisions across sessions. No more starting from scratch every time.
            </p>
          </div>
        </div>

        {/* CARD 2 */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[220px] hover:border-purple-500/30 transition-all group">
          <div>
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">⛓️</div>
            <h3 className="text-base font-black tracking-wider text-white uppercase mb-2">
              On-Chain Proof
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-mono">
              Every memory is anchored on Pharos as calldata. Immutable, verifiable, permanent.
            </p>
          </div>
        </div>

        {/* CARD 3 */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[220px] hover:border-purple-500/30 transition-all group">
          <div>
            <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">🔍</div>
            <h3 className="text-base font-black tracking-wider text-white uppercase mb-2">
              Instant Recall
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-mono">
              Search past memories with natural language. Agents pick up exactly where they left off.
            </p>
          </div>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="text-center py-8 border-t border-gray-900 text-xs font-mono text-gray-500 tracking-wider">
        EchoMind v1.0 | Built on Pharos Testnet | Chain ID 688689
      </footer>

    </div>
  )
}