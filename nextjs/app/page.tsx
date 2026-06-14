'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { 
  Brain, 
  Save, 
  Search, 
  Shield, 
  ExternalLink,
  Hash,
  Clock,
  Type,
  ChevronRight,
  Sparkles,
  Database,
  AlertCircle
} from 'lucide-react'
import RememberForm from '@/components/RememberForm'
import RecallForm from '@/components/RecallForm'
import VerifyForm from '@/components/VerifyForm'
import StatsPanel from '@/components/StatsPanel'
import RecentMemories from '@/components/RecentMemories'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'remember' | 'recall' | 'verify'>('remember')

  const handleRememberSuccess = (data: any) => {
    toast.success(`Memory stored successfully! ${data.txHash ? 'Anchored on Pharos.' : 'Stored locally.'}`)
  }

  const handleRecallSuccess = (data: any) => {
    toast.success(`Found ${data.length} related memories`)
  }

  const handleVerifySuccess = (data: any) => {
    if (data.valid) {
      toast.success('Memory verified on-chain! ✅')
    } else {
      toast.error('Memory verification failed! ❌')
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-2xl mb-6">
          <Brain className="w-12 h-12 text-accent" />
        </div>
        <h1 className="text-5xl font-bold mb-4">
          Persistent Agent Memory{' '}
          <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            Anchored on Pharos
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Store, search, and verify AI agent memories with cryptographic proof on the Pharos blockchain.
          Immutable memory storage for autonomous agents.
        </p>
      </div>

      {/* Stats Panel */}
      <StatsPanel />

      {/* Main Operations Tabs */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('remember')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 font-medium transition-colors ${
              activeTab === 'remember'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Save className="w-5 h-5" />
            Remember
          </button>
          <button
            onClick={() => setActiveTab('recall')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 font-medium transition-colors ${
              activeTab === 'recall'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Search className="w-5 h-5" />
            Recall
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 font-medium transition-colors ${
              activeTab === 'verify'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Shield className="w-5 h-5" />
            Verify
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'remember' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Save className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Store Memory</h2>
                  <p className="text-gray-400">Save agent memories locally and anchor hashes on Pharos</p>
                </div>
              </div>
              <RememberForm onSuccess={handleRememberSuccess} />
            </div>
          )}

          {activeTab === 'recall' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Search className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Recall Memories</h2>
                  <p className="text-gray-400">Semantic search through stored memories using embeddings</p>
                </div>
              </div>
              <RecallForm onSuccess={handleRecallSuccess} />
            </div>
          )}

          {activeTab === 'verify' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Verify Proof</h2>
                  <p className="text-gray-400">Validate memory integrity using on-chain transaction data</p>
                </div>
              </div>
              <VerifyForm onSuccess={handleVerifySuccess} />
            </div>
          )}
        </div>
      </div>

      {/* Recent Memories */}
      <RecentMemories />

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card group hover:border-accent/50">
          <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
            <Hash className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Immutable Anchoring</h3>
          <p className="text-gray-400">
            Every memory hash is stored as calldata on Pharos, providing cryptographic proof of existence.
          </p>
        </div>

        <div className="card group hover:border-accent/50">
          <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
            <Sparkles className="w-6 h-6 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Semantic Search</h3>
          <p className="text-gray-400">
            Find related memories using OpenAI embeddings, not just keyword matching.
          </p>
        </div>

        <div className="card group hover:border-accent/50">
          <div className="p-3 bg-green-500/10 rounded-lg w-fit mb-4">
            <Database className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Hybrid Storage</h3>
          <p className="text-gray-400">
            Fast Vercel KV for embeddings + immutable Pharos blockchain for verification.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center py-12 border-t border-gray-800">
        <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-6">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Demo Mode Active</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Ready to Deploy Your Agent Memory?</h2>
        <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
          Get started with EchoMind for your AI agents. Store memories, perform semantic search,
          and verify everything on the Pharos blockchain.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            Run Demo Script
          </button>
          <a
            href="https://atlantic.pharosscan.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on PharosScan
          </a>
        </div>
      </div>
    </div>
  )
}