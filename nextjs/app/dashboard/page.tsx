'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Address } from 'viem'
import { 
  Save, 
  Search, 
  Shield, 
  Loader2,
  ArrowRight,
  Check,
  X,
  Copy
} from 'lucide-react'
import { RecallResult, VerifyResult } from '@/types'
import { getEthereumProvider, sendPharosAnchorTx } from '@/lib/pharos-wallet'

const sha256Hex = async (value: string) => {
  if (!crypto.subtle) {
    console.warn('crypto.subtle not available. Using fallback hash.')
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = ((hash << 5) - hash) + value.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash).toString(16).padStart(64, '0')
  }
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export default function DashboardPage() {
  // Store Memory State
  const [storeLoading, setStoreLoading] = useState(false)
  const [storeForm, setStoreForm] = useState({
    agentId: 'pharos-agent',
    content: '',
    type: 'decision'
  })
  const [storedResult, setStoredResult] = useState<{ id: string; txHash: string | null } | null>(null)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)

  // Copy States
  const [copiedId, setCopiedId] = useState(false)
  const [copiedTx, setCopiedTx] = useState(false)

  const copyToClipboard = (text: string, type: 'id' | 'tx') => {
    navigator.clipboard.writeText(text)
    if (type === 'id') {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } else {
      setCopiedTx(true)
      setTimeout(() => setCopiedTx(false), 2000)
    }
    toast.success(`${type === 'id' ? 'Memory ID' : 'Transaction hash'} copied to clipboard!`)
  }

  useEffect(() => {
    const ethereum = getEthereumProvider() as any
    if (!ethereum) return

    ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletConnected(true)
        }
      })
      .catch(console.error)

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0])
        setWalletConnected(true)
      } else {
        setWalletAddress('')
        setWalletConnected(false)
      }
    }

    const handleChainChanged = () => {
      window.location.reload()
    }

    ethereum.on?.('accountsChanged', handleAccountsChanged)
    ethereum.on?.('chainChanged', handleChainChanged)

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged)
      ethereum.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [])

  const connectWallet = async () => {
    const ethereum = getEthereumProvider() as any
    if (!ethereum) {
      toast.error('No EVM wallet detected. Please install MetaMask or another browser wallet extension.')
      return null
    }

    setWalletLoading(true)
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' }) as string[]
      if (!accounts.length) {
        throw new Error('No wallet account returned')
      }

      setWalletAddress(accounts[0])
      setWalletConnected(true)
      toast.success(`Connected address: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`)
      return accounts[0]
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : 'Wallet connection rejected')
      return null
    } finally {
      setWalletLoading(false)
    }
  }

  // Recall Memory State
  const [recallLoading, setRecallLoading] = useState(false)
  const [recallForm, setRecallForm] = useState({
    agentId: 'pharos-agent',
    query: ''
  })
  const [recallResults, setRecallResults] = useState<RecallResult[]>([])

  // Verify Proof State
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [verifyForm, setVerifyForm] = useState({
    agentId: 'pharos-agent',
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
      let address = walletAddress
      if (!walletConnected || !address) {
        const connectedAddress = await connectWallet()
        if (!connectedAddress) {
          throw new Error('Connect your wallet to sign the Pharos transaction')
        }
        address = connectedAddress
      }

      const contentHash = await sha256Hex(storeForm.content)

      let txHash: string | undefined
      try {
        txHash = await sendPharosAnchorTx(address as Address, contentHash)
      } catch (walletError: any) {
        console.error('Wallet transaction failed:', walletError)
        const errMsg = walletError?.details || walletError?.message || 'Unknown error'
        toast.error(`Wallet transaction failed: ${errMsg.slice(0, 50)}${errMsg.length > 50 ? '...' : ''}. Saving locally instead.`)
      }

      const storeResponse = await fetch('/api/remember', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...storeForm,
          txHash,
        }),
      })

      const storePersisted = await storeResponse.json()
      if (!storePersisted.success) {
        throw new Error(`Saving memory failed: ${storePersisted.error}`)
      }

      const memory = storePersisted.data.memory
      setStoredResult({ id: memory.id, txHash: txHash || null })
      toast.success('Memory anchored with your wallet signature!')
      setVerifyForm({
        agentId: memory.agentId,
        memoryId: memory.id,
        txHash: txHash || '',
      })
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

  return (
    <div className="light-product-page flex flex-col justify-between max-w-7xl mx-auto font-sans">
      
      {/* BREADCRUMB */}
      <div className="mb-6">
        <Link 
          href="/" 
          className="text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1.5 uppercase tracking-wider font-bold"
        >
          ← Back to Home
        </Link>
      </div>



      {/* MAIN GRID - THREE CARDS SIDE-BY-SIDE */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
        
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
            <div className="mt-6 p-4 rounded-lg bg-green-50 border border-green-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-600 uppercase">Status</span>
                <span className="badge-green px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase">
                  ANCHORED
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] text-gray-700 font-mono flex items-center justify-between">
                  <span>MEMORY ID</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(storedResult.id, 'id')}
                    className="text-[10px] font-mono text-purple-600 hover:text-purple-500 flex items-center gap-1 transition-colors"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3 h-3 text-green-600" />
                        <span className="text-green-600">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-[11px] font-mono bg-white p-2 rounded border border-gray-200 select-all text-gray-800 break-all">
                  {storedResult.id}
                </div>
              </div>
              {storedResult.txHash && (
                <div className="space-y-1">
                  <div className="text-[10px] text-gray-700 font-mono flex items-center justify-between">
                    <span>TX HASH</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(storedResult.txHash!, 'tx')}
                      className="text-[10px] font-mono text-purple-600 hover:text-purple-500 flex items-center gap-1 transition-colors"
                    >
                      {copiedTx ? (
                        <>
                          <Check className="w-3 h-3 text-green-600" />
                          <span className="text-green-600">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] font-mono bg-white p-2 rounded border border-gray-200 select-all text-gray-800 break-all">
                    {storedResult.txHash}
                  </div>
                  <a 
                    href={`https://atlantic.pharosscan.xyz/tx/${storedResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-mono text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 mt-1"
                  >
                    View on PharosScan →
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
                  <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-purple-100 text-purple-600 uppercase tracking-wider">
                        {res.memory.type}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-green-100 text-green-700 tracking-wider">
                        {(res.similarity * 100).toFixed(1)}% Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-800 leading-relaxed">{res.memory.content}</p>
                    <div className="space-y-1.5 mt-3 border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-500">
                        <span className="font-bold">MEMORY ID</span>
                        <span>{new Date(res.memory.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-[10px] font-mono bg-white p-1.5 rounded border border-gray-200 select-all text-gray-800 break-all">
                        {res.memory.id}
                      </div>

                      {res.memory.txHash && (
                        <>
                          <div className="text-[9px] font-mono font-bold text-gray-500 mt-2">TX HASH</div>
                          <div className="text-[10px] font-mono bg-white p-1.5 rounded border border-gray-200 select-all text-gray-800 break-all">
                            {res.memory.txHash}
                          </div>
                        </>
                      )}
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
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-gray-700 uppercase">On-chain Status</span>
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
                  <div className="text-[9px] text-gray-600 font-mono uppercase tracking-wider mb-1">Local Hash</div>
                  <div className="font-mono bg-white border border-gray-200 p-2 rounded truncate text-gray-800 text-[10px] select-all">
                    {verifyResult.localHash}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1 text-gray-600 font-mono text-[9px]">
                  <div className="h-px bg-gray-300 flex-grow"></div>
                  <span>{verifyResult.valid ? "MATCHES" : "MISMATCH"}</span>
                  <div className="h-px bg-gray-300 flex-grow"></div>
                </div>

                <div>
                  <div className="text-[9px] text-gray-600 font-mono uppercase tracking-wider mb-1">On-chain Hash</div>
                  <div className="font-mono bg-white border border-gray-200 p-2 rounded truncate text-gray-800 text-[10px] select-all">
                    {verifyResult.onChainHash || 'No hash found on-chain'}
                  </div>
                </div>

                {verifyResult.blockNumber && (
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono pt-3 border-t border-gray-200">
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
