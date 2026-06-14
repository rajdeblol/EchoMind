'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function StarksplitLandingPage() {
  return (
    <div className="landing-page-white -mt-8 -mx-4 px-4 bg-white text-[#0a0f2e] font-sans pb-16">
      
      {/* HERO SECTION */}
      <section className="max-w-[1100px] mx-auto py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col items-start text-left">
          {/* Small Caps Badge */}
          <span className="border border-[#0a0f2e] bg-[#f8fafc] text-[#0a0f2e] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-6">
            Pharos Testnet • Gasless
          </span>
          
          {/* Main Headline */}
          <h1 className="text-[48px] md:text-[64px] font-black text-[#0a0f2e] leading-[1.05] mb-6 tracking-tight uppercase">
            AGENTS FORGET.<br />
            ECHOMIND<br />
            DOESN'T.
          </h1>
          
          {/* Subtitle */}
          <p className="text-sm md:text-base text-gray-500 mb-8 leading-relaxed max-w-md">
            Persistent on-chain memory for AI agents. Store decisions, recall context, verify integrity.
          </p>
          
          {/* CTA Buttons - Capsule style with thick borders */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link 
              href="/dashboard"
              className="bg-[#4f7df7] text-white border-2 border-[#0a0f2e] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#3767ea] transition-all transform hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#1b2340] shadow-[0_4px_0_0_#1b2340] flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            
            <Link 
              href="/how-it-works"
              className="bg-white text-[#0a0f2e] border-2 border-[#0a0f2e] px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all transform hover:-translate-y-[1px] hover:shadow-[0_5px_0_0_#1b2340] shadow-[0_4px_0_0_#1b2340]"
            >
              How It Works
            </Link>
          </div>
          
          {/* Feature Pills - Pill border style */}
          <div className="flex flex-wrap gap-2.5">
            <span className="border-2 border-[#0a0f2e] bg-white text-[#0a0f2e] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shadow-[0_3px_0_0_#1b2340]">
              No Mock Data
            </span>
            <span className="border-2 border-[#0a0f2e] bg-white text-[#0a0f2e] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shadow-[0_3px_0_0_#1b2340]">
              On-Chain Proof
            </span>
            <span className="border-2 border-[#0a0f2e] bg-white text-[#0a0f2e] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono shadow-[0_3px_0_0_#1b2340]">
              Semantic Recall
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono mb-2">
                LATEST MEMORY
              </div>
            </div>
            <span className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] px-3 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase font-mono whitespace-nowrap shadow-[0_2px_0_0_#86efac]">
              ANCHORED ✓
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="bg-white border-2 border-[#0a0f2e] px-4 py-3 rounded-lg shadow-[0_3px_0_0_#1b2340]">
              <span className="block text-[9px] uppercase tracking-wider text-gray-600 font-mono mb-1">Agent ID</span>
              <span className="block text-sm font-bold text-[#0a0f2e] font-mono">trader-01</span>
            </div>

            <div className="bg-white border-2 border-[#0a0f2e] px-4 py-3 rounded-lg shadow-[0_3px_0_0_#1b2340]">
              <span className="block text-[9px] uppercase tracking-wider text-gray-600 font-mono mb-1">Type</span>
              <span className="block text-sm font-bold text-[#0a0f2e] font-mono">decision</span>
            </div>
          </div>

          <div className="bg-white border-2 border-[#0a0f2e] px-4 py-4 rounded-lg mb-5 shadow-[0_3px_0_0_#1b2340]">
            <span className="block text-[9px] uppercase tracking-wider text-gray-600 font-mono mb-1">Content</span>
            <p className="text-sm font-semibold text-[#0a0f2e] leading-relaxed">
              Swapped USDC → WETH at $3,180 to rebalance risk.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#f8fafc] border-2 border-[#0a0f2e] p-4 rounded-lg shadow-[0_3px_0_0_#1b2340]">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block mb-1 font-mono">
                TX
              </span>
              <span className="font-mono text-[#0f172a] select-all block font-semibold">
                0xcb58aa...037a
              </span>
            </div>

            <div className="bg-[#f8fafc] border-2 border-[#0a0f2e] p-4 rounded-lg shadow-[0_3px_0_0_#1b2340]">
              <span className="text-[9px] font-bold text-gray-600 uppercase tracking-wider block mb-1 font-mono">
                Block
              </span>
              <span className="font-mono text-[#0f172a] font-bold block">#1548293</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-5 pt-4 border-t-2 border-[#0a0f2e]">
            <span className="text-[10px] font-mono text-[#475569]">Stored 2 min ago</span>
            <a 
              href="https://atlantic.pharosscan.xyz/tx/0xcb58aa000000000000000000000000000000037a"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-[#2563eb] hover:text-[#1d4ed8] hover:underline flex items-center gap-0.5 font-mono"
            >
              View on PharosScan ↗
            </a>
          </div>

          <div className="mt-6 bg-[#d1fae5] border-2 border-[#10b981] text-[#065f46] px-4 py-2.5 rounded-lg text-xs font-bold text-center font-mono shadow-[0_3px_0_0_#0f766e]">
            Tx confirmed on PharosScan
          </div>
        </div>

      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-white border-t-2 border-[#0a0f2e] py-20 px-4">
        <div className="max-w-[1100px] mx-auto">
          {/* Header Title */}
          <h2 className="text-center text-lg md:text-xl font-black text-[#0a0f2e] tracking-widest uppercase mb-16">
            HOW IT WORKS
          </h2>
          
          {/* 2x2 Grid Starksplit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* STEP 1 */}
            <div className="starksplit-card p-6">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                01. REMEMBER
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold leading-relaxed">
                Call remember() — EchoMind anchors a keccak256 hash on Pharos as calldata.
              </p>
            </div>

            {/* STEP 2 */}
            <div className="starksplit-card p-6">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                02. RECALL
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold leading-relaxed">
                Query memories in natural language. Returns relevant context with scores.
              </p>
            </div>

            {/* STEP 3 */}
            <div className="starksplit-card p-6">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                03. VERIFY
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold leading-relaxed">
                Pass any txHash to verify(). On-chain calldata is source of truth.
              </p>
            </div>

            {/* STEP 4 */}
            <div className="starksplit-card p-6">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                04. INTEGRATE
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-semibold leading-relaxed">
                Drop-in Skill. Any Pharos agent calls EchoMind in 3 lines of TypeScript.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-[#0a0f2e] py-8 bg-white text-[11px] font-mono text-gray-500">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 font-bold text-[#0a0f2e]">
          <div>
            EchoMind v1.0 | Pharos Testnet | Chain ID 688689
          </div>
          <a 
            href="https://github.com/rajdeblol/EchoMind" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#2563eb] transition-colors flex items-center gap-0.5"
          >
            GitHub ↗
          </a>
        </div>
      </footer>

    </div>
  )
}
