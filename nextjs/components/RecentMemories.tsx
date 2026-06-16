'use client'

import { useState, useEffect } from 'react'
import { Clock, Hash, Type, ExternalLink, ChevronRight } from 'lucide-react'
import { Memory } from '@/types'

export default function RecentMemories() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMemories([])
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Clock className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Recent Memories</h2>
            <p className="text-gray-400">Latest stored memories from all agents</p>
          </div>
        </div>
        <button className="text-sm text-accent hover:text-accent/80 transition-colors">
          View all →
        </button>
      </div>

      {memories.length === 0 && (
        <div className="py-10 text-center text-sm text-gray-500">
          No live memories loaded yet.
        </div>
      )}

      <div className="space-y-4">
        {memories.map((memory) => (
          <div key={memory.id} className="group p-4 rounded-lg border border-gray-800 hover:border-accent/50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-2 py-1 text-xs font-medium rounded ${
                    memory.type === 'text' ? 'bg-blue-500/10 text-blue-500' :
                    memory.type === 'code' ? 'bg-green-500/10 text-green-500' :
                    memory.type === 'event' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    <div className="flex items-center gap-1">
                      <Type className="w-3 h-3" />
                      {memory.type.toUpperCase()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(memory.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  {memory.txHash ? (
                    <div className="flex items-center gap-1 text-xs text-green-500">
                      <Hash className="w-3 h-3" />
                      Anchored
                    </div>
                  ) : (
                    <div className="text-xs text-yellow-500">Pending</div>
                  )}
                </div>
                
                <p className="text-gray-300 mb-3 line-clamp-2">{memory.content}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span>Agent:</span>
                      <span className="font-medium text-gray-400">{memory.agentId}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <Hash className="w-3 h-3" />
                      {memory.id.slice(0, 8)}...
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {memory.txHash && (
                      <a
                        href={`https://atlantic.pharosscan.xyz/tx/${memory.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Tx
                      </a>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-accent ml-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {memories.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-800 text-center">
          <div className="text-sm text-gray-400">
            Showing {memories.length} live memories
          </div>
        </div>
      )}
    </div>
  )
}
