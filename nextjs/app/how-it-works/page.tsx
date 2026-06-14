'use client'

import Link from 'next/link'
import { Database, Search, Shield, ArrowRight } from 'lucide-react'

export default function HowItWorks() {
  return (
    <div className="light-product-page flex flex-col justify-between max-w-7xl mx-auto font-sans px-4">
      
      {/* HEADER */}
      <section className="text-left mb-12 max-w-3xl pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
          System Architecture
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.9] text-white mb-6 uppercase">
          HOW ECHOMIND<br />
          WORKS.
        </h1>
        
        <p className="text-base md:text-lg font-mono text-gray-400 leading-relaxed max-w-2xl">
          Three primitives. One memory layer for all Pharos agents.
        </p>
      </section>

      {/* SECTION 1 - THE PROBLEM */}
      <section className="mb-14 max-w-4xl">
        <div className="premium-card p-8 border-l-4 border-l-purple-500">
          <div className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-3">THE PROBLEM</div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-4">AI Agents Are Amnesiac</h2>
          <p className="text-gray-400 leading-relaxed text-sm md:text-base">
            Every time an AI agent starts a new session, it forgets everything. 
            Past decisions, previous interactions, learned preferences — all gone. 
            This makes agents unreliable, repetitive, and impossible to audit.
          </p>
        </div>
      </section>

      {/* SECTION 2 - THE SOLUTION */}
      <section className="mb-14">
        <div className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-6">THE SOLUTION</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* STEP 01 */}
          <div className="premium-card p-6 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono font-bold text-gray-500">STEP 01</span>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Database className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-3">REMEMBER</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                The agent calls <code className="text-[11px] font-mono text-purple-400">remember()</code> with any decision or interaction. 
                EchoMind computes a keccak256 hash of the memory and sends it 
                as calldata in a Pharos transaction. The memory is now permanent.
              </p>
            </div>
          </div>

          {/* STEP 02 */}
          <div className="premium-card p-6 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono font-bold text-gray-500">STEP 02</span>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Search className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-3">RECALL</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                On the next session, the agent calls <code className="text-[11px] font-mono text-purple-400">recall()</code> with a natural language query. 
                EchoMind searches all stored memories and returns the most relevant ones 
                with similarity scores. The agent picks up exactly where it left off.
              </p>
            </div>
          </div>

          {/* STEP 03 */}
          <div className="premium-card p-6 min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono font-bold text-gray-500">STEP 03</span>
                <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider mb-3">VERIFY</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Anyone can call <code className="text-[11px] font-mono text-purple-400">verify()</code> with a txHash to prove a memory exists 
                and has not been tampered with. The on-chain calldata is the 
                source of truth — no trust required.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3 - USE CASES */}
      <section className="mb-14">
        <div className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-6">USE CASES</div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-6 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">DeFi Trading Agents</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              remember past trades, avoid repeating mistakes
            </p>
          </div>

          <div className="premium-card p-6 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Social Agents</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              remember user preferences across sessions
            </p>
          </div>

          <div className="premium-card p-6 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">DAO Governance Agents</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              immutable audit trail of every decision
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4 - TECHNICAL SPEC */}
      <section className="mb-14">
        <div className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-6">TECHNICAL SPEC</div>
        
        <div className="premium-card p-6 font-mono text-xs text-gray-700 space-y-2 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-gray-900">
            <span className="text-gray-500 font-bold uppercase tracking-wider">Network</span>
            <span className="sm:col-span-3 text-white">Pharos Atlantic Testnet</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-gray-900">
            <span className="text-gray-500 font-bold uppercase tracking-wider">Chain ID</span>
            <span className="sm:col-span-3 text-white">688689</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-gray-900">
            <span className="text-gray-500 font-bold uppercase tracking-wider">RPC</span>
            <span className="sm:col-span-3 text-purple-400 break-all select-all">https://atlantic.dplabs-internal.com</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-gray-900">
            <span className="text-gray-500 font-bold uppercase tracking-wider">Anchor</span>
            <span className="sm:col-span-3 text-gray-400 break-all">keccak256(agentId + content + timestamp) as tx calldata</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5 border-b border-gray-900">
            <span className="text-gray-500 font-bold uppercase tracking-wider">Storage</span>
            <span className="sm:col-span-3 text-white">Vercel KV</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-1.5">
            <span className="text-gray-500 font-bold uppercase tracking-wider">Search</span>
            <span className="sm:col-span-3 text-white">Keyword similarity matching</span>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BUTTON */}
      <div className="text-center py-6 mb-16">
        <Link 
          href="/?scroll=dashboard" 
          className="btn-purple px-8 py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider inline-flex items-center gap-2"
        >
          <span>Try It Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-gray-900 text-xs font-mono text-gray-500 tracking-wider">
        Built on Pharos Testnet | Chain ID 688689 | EchoMind v1.0
      </footer>

    </div>
  )
}
