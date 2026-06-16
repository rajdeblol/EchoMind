'use client'

import { useState } from 'react'
import { Save, Loader2, Hash, Type, User } from 'lucide-react'

interface RememberFormProps {
  onSuccess: (data: any) => void
}

export default function RememberForm({ onSuccess }: RememberFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    agentId: 'pharos-agent',
    content: '',
    type: 'text' as const,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/remember', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(result.data)
        setFormData({
          agentId: 'pharos-agent',
          content: '',
          type: 'text',
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error storing memory:', error)
      alert(error instanceof Error ? error.message : 'Failed to store memory')
    } finally {
      setLoading(false)
    }
  }

  return (
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
              <Type className="w-4 h-4" />
              Memory Type
            </div>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="input-field w-full"
          >
            <option value="text">Text</option>
            <option value="code">Code</option>
            <option value="event">Event</option>
            <option value="image">Image</option>
            <option value="audio">Audio</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4" />
              Memory Content
            </div>
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="input-field w-full min-h-[120px]"
            placeholder="Enter the memory content..."
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Memory will be stored in Vercel KV and anchored on Pharos blockchain
        </div>
        <button
          type="submit"
          disabled={loading || !formData.content.trim()}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Storing...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Store Memory
            </>
          )}
        </button>
      </div>
    </form>
  )
}
