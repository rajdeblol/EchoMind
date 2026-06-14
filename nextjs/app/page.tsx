'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  Brain, 
  Save, 
  Search, 
  Shield, 
  ExternalLink,
  Loader2,
  ArrowRight,
  Check,
  X,
  Wallet
} from 'lucide-react'
import { RecallResult, VerifyResult } from '@/types'

export default function Home() {
  // Store Memory State
  const [storeLoading, setStoreLoading] = useState(false)
  const [storeForm, setStoreForm] = useState({
    agentId: 'demo-agent',
    content: '',
    type: 'decision'
  })
  const [storedResult, setStoredResult] = useState<{ id: string; txHash: string | null } | null>(null)

  // Recall Memory State
  const [recallLoading, setRecallLoading] = useState(false)
  const [recallForm, setRecallForm] = useState({
    agentId: 'demo-agent',
    query: ''
  })
  const [recallResults, setRecallResults] = useState<RecallResult[]>([])

  // Verify Proof State
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyForm, setVerifyForm] = useState({
    memoryId: '',
    txHash: ''
  })
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)

  // Handle Store Memory Submission
  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStoreLoading(true)
    setStoredResult(null)

    try {
      const response = await fetch('/api/remember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm),
      })

      const result = await response.json()

      if (result.success) {
        setStoredResult(result.data.memory)
        toast.success('Memory anchored successfully!')
        // Auto-fill memory ID and transaction hash in the verify form for convenience!
        setVerifyForm({
          memoryId: result.data.memory.id,
          txHash: result.data.memory.txHash || ''
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to store memory')
    } finally {
      setStoreLoading(false)
    }
  }

  // Handle Recall Memories Submission
  const handleRecallSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecallLoading(true)
    setRecallResults([])

    try {
      const response = await fetch('/api/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: recallForm.agentId,
          query: recallForm.query,
          topK: 5
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRecallResults(result.data)
        toast.success(`Found ${result.data.length} matching memories`)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to recall memories')
    } finally {
      setRecallLoading(false)
    }
  }

  // Handle Verify Proof Submission
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setVerifyLoading(true)
    setVerifyResult(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyForm),
      })

      const result = await response.json()

      if (result.success) {
        setVerifyResult(result.data)
        if (result.data.valid) {
          toast.success('Verification succeeded! ✓ VALID')
        } else {
          toast.error('Verification failed! ✗ INVALID')
        }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Failed to verify proof')
    } finally {
      setVerifyLoading(false)
    }
  }

  // Load sample verification data
  const loadVerifySample = () => {
    setVerifyForm({
      memoryId: 'demo-memory-id',
      txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    })
    toast.success('Sample verification data loaded')
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'dashboard' || window.location.hash === '#dashboard') {
      setTimeout(() => {
        document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  }, []);

  return (
    <div className="flex flex-col justify-between max-w-7xl mx-auto font-sans">
      
      {/* HERO SECTION */}
      <section className="text-left mb-14 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
          Cryptographic Agent Memory
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9] text-white mb-6 uppercase">
          REMEMBER EVERY<br />
          DECISION.<br />
          VERIFY NOTHING<br />
          BLIND.
        </h1>
        
        <p className="text-sm md:text-base font-mono text-gray-400 mb-8 leading-relaxed max-w-2xl">
          Persistent Cryptographic Agent Memory on Pharos
        </p>
        
        <div className="flex flex-wrap gap-3">
          <span className="badge-pill px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
            No Mock Data
          </span>
          <span className="badge-pill px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
            On-Chain Proof
          </span>
          <span className="badge-pill px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider font-semibold">
            Semantic Recall
          </span>
        </div>
      </section>

      {/* MAIN GRID - THREE CARDS SIDE-BY-SIDE */}
      <main id="dashboard" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
        
        {/* CARD 1: STORE MEMORY */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-6 flex items-center gap-2">
              <Save className="w-4 h-4" />
              <span>STORE MEMORY</span>
            </div>
            
            <form onSubmit={handleStoreSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Agent ID</label>
                <input 
                  type="text"
                  required
                  value={storeForm.agentId}
                  onChange={(e) => setStoreForm({ ...storeForm, agentId: e.target.value })}
                  className="premium-input w-full px-4 py-3 rounded-lg text-sm"
                  placeholder="Enter agent identifier"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Memory Type</label>
                <select 
                  value={storeForm.type}
                  onChange={(e) => setStoreForm({ ...storeForm, type: e.target.value })}
                  className="premium-input w-full px-4 py-3 rounded-lg text-sm appearance-none cursor-pointer"
                >
                  <option value="decision">decision</option>
                  <option value="interaction">interaction</option>
                  <option value="outcome">outcome</option>
                  <option value="preference">preference</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Content</label>
                <textarea 
                  required
                  rows={4}
                  value={storeForm.content}
                  onChange={(e) => setStoreForm({ ...storeForm, content: e.target.value })}
                  className="premium-input w-full px-4 py-3 rounded-lg text-sm resize-none"
                  placeholder="Enter the memory content..."
                />
              </div>

              <button 
                type="submit"
                disabled={storeLoading || !storeForm.content.trim()}
                className="w-full btn-purple py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {storeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Anchoring...</span>
                  </>
                ) : (
                  <>
                    <span>Anchor Memory</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Stored Result Details */}
          {storedResult && (
            <div className="mt-6 p-4 rounded-lg bg-green-500/5 border border-green-500/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Status</span>
                <span className="badge-green px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                  ANCHORED
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-gray-500 font-mono">MEMORY ID</div>
                <div className="text-[11px] font-mono bg-black/40 p-2 rounded select-all truncate text-gray-300">
                  {storedResult.id}
                </div>
              </div>
              {storedResult.txHash && (
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-500 font-mono">TX HASH</div>
                  <div className="text-[11px] font-mono bg-black/40 p-2 rounded select-all truncate text-gray-300">
                    {storedResult.txHash}
                  </div>
                  <a 
                    href={`https://atlantic.pharosscan.xyz/tx/${storedResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 mt-1"
                  >
                    View on PharosScan ↗
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 2: RECALL CONTEXT */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="text-xs font-mono tracking-widest text-purple-400 uppercase mb-6 flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>RECALL CONTEXT</span>
            </div>

            <form onSubmit={handleRecallSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Agent ID</label>
                <input 
                  type="text"
                  required
                  value={recallForm.agentId}
                  onChange={(e) => setRecallForm({ ...recallForm, agentId: e.target.value })}
                  className="premium-input w-full px-4 py-3 rounded-lg text-sm"
                  placeholder="Enter agent identifier"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Query</label>
                <textarea 
                  required
                  rows={4}
                  value={recallForm.query}
                  onChange={(e) => setRecallForm({ ...recallForm, query: e.target.value })}
                  className="premium-input w-full px-4 py-3 rounded-lg text-sm resize-none"
                  placeholder="What would you like to recall?"
                />
              </div>

              <button 
                type="submit"
                disabled={recallLoading || !recallForm.query.trim()}
                className="w-full btn-purple py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recallLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Search Memories</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Search Results */}
          {recallResults.length > 0 && (
            <div className="mt-6 space-y-3 max-h-[280px] overflow-y-auto pr-1">
              <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Results ({recallResults.length})</div>
              <div className="space-y-2">
                {recallResults.map((res, i) => (
                  <div key={i} className="p-3 rounded-lg bg-black/40 border border-gray-900/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-purple-500/10 text-purple-400 uppercase tracking-wider">
                        {res.memory.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-green-500/10 text-green-400 tracking-wider">
                        {(res.similarity * 100).toFixed(1)}% Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{res.memory.content}</p>
                    <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                      <span>ID: {res.memory.id.slice(0, 8)}...</span>
                      <span>{new Date(res.memory.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CARD 3: VERIFY PROOF */}
        <div className="premium-card p-6 flex flex-col justify-between min-h-[500px]">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-mono tracking-widest text-purple-400 uppercase flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>VERIFY PROOF</span>
              </div>
              <button 
                onClick={loadVerifySample}
                className="text-[10px] font-mono text-gray-500 hover:text-purple-400 tracking-wider transition-colors"
              >
                [LOAD SAMPLE]
              </button>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Memory ID</label>
                <input 
                  type="text"
                  required
                  value={verifyForm.memoryId}
                  onChange={(e) => setVerifyForm({ ...verifyForm, memoryId: e.target.value })}
                  className="premium-input w-full px-4 py-3 rounded-lg text-sm font-mono"
                  placeholder="Enter memory ID"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Transaction Hash</label>
                <input 
                  type="text"
                  required
                  value={verifyForm.txHash}
                  onChange={(e) => setVerifyForm({ ...verifyForm, txHash: e.target.value })}
                  className="premium-input w-full px-4 py-3 rounded-lg text-sm font-mono"
                  placeholder="Enter transaction hash"
                />
              </div>

              <button 
                type="submit"
                disabled={verifyLoading || !verifyForm.memoryId.trim() || !verifyForm.txHash.trim()}
                className="w-full btn-purple py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Proof</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Verification Result details */}
          {verifyResult && (
            <div className="mt-6 p-4 rounded-lg bg-black/40 border border-gray-900/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">On-chain Status</span>
                {verifyResult.valid ? (
                  <span className="badge-green px-3 py-1 rounded text-xs font-black tracking-wider flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>✓ VALID</span>
                  </span>
                ) : (
                  <span className="badge-red px-3 py-1 rounded text-xs font-black tracking-wider flex items-center gap-1">
                    <X className="w-3.5 h-3.5" />
                    <span>✗ INVALID</span>
                  </span>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">Local Hash</div>
                  <div className="font-mono bg-black/40 p-2 rounded truncate text-gray-300 text-[10px] select-all">
                    {verifyResult.localHash}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1 text-gray-600 font-mono text-[9px]">
                  <div className="h-px bg-gray-800/80 flex-grow"></div>
                  <span>{verifyResult.valid ? "MATCHES" : "MISMATCH"}</span>
                  <div className="h-px bg-gray-800/80 flex-grow"></div>
                </div>

                <div>
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-wider mb-1">On-chain Hash</div>
                  <div className="font-mono bg-black/40 p-2 rounded truncate text-gray-300 text-[10px] select-all">
                    {verifyResult.onChainHash || 'No hash found on-chain'}
                  </div>
                </div>

                {verifyResult.blockNumber && (
                  <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pt-3 border-t border-gray-900">
                    <span>Block: #{verifyResult.blockNumber}</span>
                    {verifyResult.txHash && (
                      <a 
                        href={`https://atlantic.pharosscan.xyz/tx/${verifyResult.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 inline-flex items-center gap-0.5"
                      >
                        PharosScan ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t border-gray-900 text-xs font-mono text-gray-500 tracking-wider">
        Built on Pharos Testnet | Chain ID 688689 | EchoMind v1.0
      </footer>

    </div>
  )
}