'use client'

import { useState } from 'react'
import { Shield, Loader2, Hash, Check, X, ExternalLink } from 'lucide-react'
import { VerifyResult } from '@/types'

interface VerifyFormProps {
  onSuccess: (data: any) => void
}

export default function VerifyForm({ onSuccess }: VerifyFormProps) {
  const [loading, setLoading] = useState(false)
  const [verificationResult, setVerificationResult] = useState<VerifyResult | null>(null)
  const [formData, setFormData] = useState({
    memoryId: '',
    txHash: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setVerificationResult(null)

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setVerificationResult(result.data)
        onSuccess(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error verifying memory:', error)
      alert(error instanceof Error ? error.message : 'Failed to verify memory')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Memory ID
              </div>
            </label>
            <input
              type="text"
              value={formData.memoryId}
              onChange={(e) => setFormData({ ...formData, memoryId: e.target.value })}
              className="input-field w-full font-mono text-sm"
              placeholder="Enter memory identifier"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Transaction Hash
              </div>
            </label>
            <input
              type="text"
              value={formData.txHash}
              onChange={(e) => setFormData({ ...formData, txHash: e.target.value })}
              className="input-field w-full font-mono text-sm"
              placeholder="Enter anchored Pharos transaction hash"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Verify memory hash against on-chain transaction data
          </div>
          <button
            type="submit"
            disabled={loading || !formData.memoryId.trim() || !formData.txHash.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Verify Proof
              </>
            )}
          </button>
        </div>
      </form>

      {/* Verification Result */}
      {verificationResult && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Verification Result</h3>
          <div className={`card ${verificationResult.valid ? 'border-green-500/50' : 'border-red-500/50'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${verificationResult.valid ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {verificationResult.valid ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <X className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold">
                    {verificationResult.valid ? '✓ Verified' : '✗ Verification Failed'}
                  </h4>
                  <p className="text-gray-400">
                    {verificationResult.valid 
                      ? 'Memory integrity confirmed on Pharos blockchain'
                      : 'Memory hash does not match on-chain data'}
                  </p>
                </div>
              </div>
              {verificationResult.txHash && (
                <a
                  href={`https://atlantic.pharosscan.xyz/tx/${verificationResult.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on PharosScan
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Memory ID</label>
                  <div className="font-mono text-sm bg-gray-900/50 rounded px-3 py-2">
                    {verificationResult.memoryId}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Local Hash</label>
                  <div className="font-mono text-sm bg-gray-900/50 rounded px-3 py-2 truncate">
                    {verificationResult.localHash}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Block Number</label>
                  <div className="font-mono text-sm bg-gray-900/50 rounded px-3 py-2">
                    {verificationResult.blockNumber || 'Pending'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Transaction Hash</label>
                  <div className="font-mono text-sm bg-gray-900/50 rounded px-3 py-2 truncate">
                    {verificationResult.txHash}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">On-chain Hash</label>
                  <div className="font-mono text-sm bg-gray-900/50 rounded px-3 py-2 truncate">
                    {verificationResult.onChainHash}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Timestamp</label>
                  <div className="font-mono text-sm bg-gray-900/50 rounded px-3 py-2">
                    {verificationResult.timestamp 
                      ? new Date(Number(verificationResult.timestamp) * 1000).toLocaleString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Hash Comparison */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <label className="block text-xs font-medium text-gray-400 mb-2">Hash Comparison</label>
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1">
                  <div className="text-center text-sm font-medium text-gray-300 mb-2">Local Hash</div>
                  <div className="font-mono text-xs bg-gray-900/50 rounded px-3 py-2 truncate text-center">
                    {verificationResult.localHash.slice(0, 32)}...
                  </div>
                </div>
                <div className={`text-2xl ${verificationResult.valid ? 'text-green-500' : 'text-red-500'}`}>
                  {verificationResult.valid ? '=' : '≠'}
                </div>
                <div className="flex-1">
                  <div className="text-center text-sm font-medium text-gray-300 mb-2">On-chain Hash</div>
                  <div className="font-mono text-xs bg-gray-900/50 rounded px-3 py-2 truncate text-center">
                    {verificationResult.onChainHash.slice(0, 32)}...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
