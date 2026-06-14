'use client'

import Link from 'next/link'
import { ArrowRight, ExternalLink } from 'lucide-react'

export default function WhiteLandingPage() {
  return (
    <div className="landing-page-white -mt-8 -mx-4 px-4 bg-white text-[#0a0f2e] font-sans pb-16">
      
      {/* HERO SECTION */}
      <section className="max-w-[1100px] mx-auto py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT COLUMN */}
        <div className="flex flex-col items-start text-left">
          {/* Small Caps Text */}
          <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">
            Pharos Testnet • Gasless Memory
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
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link 
              href="/dashboard"
              className="bg-[#2563eb] text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#1d4ed8] transition-all transform hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.25)] flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            
            <Link 
              href="/how-it-works"
              className="border border-[#0a0f2e] text-[#0a0f2e] bg-transparent px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-all transform hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
            >
              How It Works
            </Link>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2.5">
            <span className="border border-[#cbd5e1] text-[#0a0f2e] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              No Mock Data
            </span>
            <span className="border border-[#cbd5e1] text-[#0a0f2e] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              On-Chain Proof
            </span>
            <span className="border border-[#cbd5e1] text-[#0a0f2e] px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono">
              Semantic Recall
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-full max-w-md mx-auto">
          {/* Latest Memory Status Card */}
          <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)] flex flex-col justify-between">
            <div>
              {/* Header row */}
              <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4 mb-5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  LATEST MEMORY
                </span>
                <span className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#16a34a] px-2.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                  ANCHORED ✓
                </span>
              </div>

              {/* Card content fields */}
              <div className="space-y-3.5 text-xs pb-5">
                <div className="flex items-start">
                  <span className="w-24 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-0.5 font-mono">
                    Agent ID:
                  </span>
                  <span className="font-mono text-[#0a0f2e] font-bold">trader-01</span>
                </div>
                
                <div className="flex items-start">
                  <span className="w-24 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-0.5 font-mono">
                    Type:
                  </span>
                  <span className="font-mono text-[#0a0f2e] font-bold">decision</span>
                </div>
                
                <div className="flex items-start">
                  <span className="w-24 text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-0.5 font-mono">
                    Content:
                  </span>
                  <span className="text-gray-700 font-medium leading-relaxed">
                    Swapped USDC → WETH at $3,180
                  </span>
                </div>
              </div>

              {/* Divider and blockchain detail */}
              <div className="border-t border-[#e2e8f0] pt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5 font-mono">
                      TX:
                    </span>
                    <span className="font-mono text-gray-600 select-all block">
                      0xcb58aa...037a
                    </span>
                  </div>
                  <a 
                    href="https://atlantic.pharosscan.xyz/tx/0xcb58aa000000000000000000000000000000037a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-[#2563eb] hover:text-[#1d4ed8] hover:underline flex items-center gap-0.5 font-mono"
                  >
                    View on PharosScan ↗
                  </a>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider font-mono">
                    Block:
                  </span>
                  <span className="font-mono text-gray-600 font-bold">#1548293</span>
                </div>
              </div>
            </div>

            {/* Confirmed green status banner */}
            <div className="mt-6 -mx-6 -mb-6 bg-[#f0fdf4] border-t border-[#bbf7d0] text-[#16a34a] px-6 py-3.5 rounded-b-[12px] text-xs font-bold flex items-center gap-1.5">
              <span>✓ Tx confirmed on PharosScan</span>
            </div>
          </div>
        </div>

      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-white border-t border-[#e2e8f0] py-20 px-4">
        <div className="max-w-[1100px] mx-auto">
          {/* Header Title */}
          <h2 className="text-center text-xl md:text-2xl font-black text-[#0a0f2e] tracking-widest uppercase mb-16">
            HOW IT WORKS
          </h2>
          
          {/* 2x2 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* STEP 1 */}
            <div className="how-it-works-card">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                01. REMEMBER
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
                Call remember() — EchoMind anchors a keccak256 hash on Pharos as calldata.
              </p>
            </div>

            {/* STEP 2 */}
            <div className="how-it-works-card">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                02. RECALL
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
                Query memories in natural language. Returns relevant context with scores.
              </p>
            </div>

            {/* STEP 3 */}
            <div className="how-it-works-card">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                03. VERIFY
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
                Pass any txHash to verify(). On-chain calldata is source of truth.
              </p>
            </div>

            {/* STEP 4 */}
            <div className="how-it-works-card">
              <div className="text-[10px] font-mono font-bold text-[#2563eb] tracking-widest mb-3 uppercase">
                04. INTEGRATE
              </div>
              <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed">
                Drop-in Skill. Any Pharos agent calls EchoMind in 3 lines of TypeScript.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e2e8f0] py-8 bg-white text-[11px] font-mono text-gray-500">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            EchoMind v1.0 | Pharos Testnet | Chain ID 688689
          </div>
          <a 
            href="https://github.com/rajdeblol/EchoMind" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#2563eb] transition-colors flex items-center gap-0.5 font-bold"
          >
            GitHub ↗
          </a>
        </div>
      </footer>

    </div>
  )
}