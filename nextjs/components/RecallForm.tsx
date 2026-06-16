'use client'

import { useState } from 'react'
import { Search, Loader2, User, Filter, ChevronRight } from 'lucide-react'
import { RecallResult } from '@/types'

interface RecallFormProps {
  onSuccess: (data: any) => void
}

export default function RecallForm({ onSuccess }: RecallFormProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<RecallResult[]>([])
  const [formData, setFormData] = useState({
    agentId: 'pharos-agent',
    query: '',
    topK: 5,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResults([])

    try {
      const response = await fetch('/api/recall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setResults(result.data)
        onSuccess(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error recalling memories:', error)
      alert(error instanceof Error ? error.message : 'Failed to recall memories')
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
                <User className="w-4 h-4" />
                Agent ID
              </div>
            </label>
            <input
              type="text"
              value={formData.agentId}
              onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
            className="input-field w-full"
              placeholder="Enter agent identifier"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search Query
              </div>
            </label>
            <textarea
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
              className="input-field w-full min-h-[100px]"
              placeholder="What would you like to recall?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Number of Results
              </div>
            </label>
            <select
              value={formData.topK}
              onChange={(e) => setFormData({ ...formData, topK: parseInt(e.target.value) })}
              className="input-field w-full"
            >
              <option value="3">Top 3</option>
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="20">Top 20</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <div className="text-sm text-gray-400">
            Semantic search using OpenAI embeddings
          </div>
          <button
            type="submit"
            disabled={loading || !formData.query.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Recall Memories
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Search Results ({results.length})</h3>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={result.memory.id} className="card group hover:border-accent/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent border border-accent/20">
                        {result.memory.type.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(result.memory.timestamp).toLocaleString()}
                      </div>
                      <div className="text-sm font-medium text-green-500">
                        {result.similarity.toFixed(4)} similarity
                      </div>
                    </div>
                    <p className="text-gray-300 mb-3">{result.memory.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{result.memory.id.slice(0, 8)}...</span>
                      </div>
                      {result.memory.txHash && (
                        <div className="flex items-center gap-1">
                          <span className="text-blue-400">Anchored</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-accent ml-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
