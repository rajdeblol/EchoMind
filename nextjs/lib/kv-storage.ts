import { kv } from '@vercel/kv'
import { Memory, MemoryType, RecallResult } from '@/types'

const KV_PREFIX = 'echomind:'

export class KVMemoryStorage {
  private getKey(agentId: string, memoryId: string): string {
    return `${KV_PREFIX}${agentId}:${memoryId}`
  }

  private getAgentKey(agentId: string): string {
    return `${KV_PREFIX}agent:${agentId}:memories`
  }

  async storeMemory(memory: Memory): Promise<void> {
    const memoryKey = this.getKey(memory.agentId, memory.id)
    const agentKey = this.getAgentKey(memory.agentId)
    
    // Store memory with TTL (30 days)
    await kv.set(memoryKey, JSON.stringify(memory), { ex: 60 * 60 * 24 * 30 })
    
    // Store memory ID in a list for the agent
    await kv.lpush(agentKey, memory.id)
  }

  async getMemory(agentId: string, memoryId: string): Promise<Memory | null> {
    const memoryKey = this.getKey(agentId, memoryId)
    const data = await kv.get<string>(memoryKey)
    
    if (!data) return null
    return JSON.parse(data)
  }

  async getMemoriesByAgent(agentId: string, limit: number = 100): Promise<Memory[]> {
    const agentKey = this.getAgentKey(agentId)
    
    // Get memory IDs from the list
    const memoryIds = await kv.lrange<string>(agentKey, 0, limit - 1)
    
    // Fetch all memories
    const memories: Memory[] = []
    for (const memoryId of memoryIds) {
      const memory = await this.getMemory(agentId, memoryId)
      if (memory) memories.push(memory)
    }
    
    return memories
  }

  async updateMemory(agentId: string, memoryId: string, updates: Partial<Memory>): Promise<void> {
    const memory = await this.getMemory(agentId, memoryId)
    if (!memory) throw new Error(`Memory not found: ${memoryId}`)
    
    const updatedMemory = { ...memory, ...updates }
    const memoryKey = this.getKey(agentId, memoryId)
    
    await kv.set(memoryKey, JSON.stringify(updatedMemory), { ex: 60 * 60 * 24 * 30 })
  }

  async deleteMemory(agentId: string, memoryId: string): Promise<void> {
    const memoryKey = this.getKey(agentId, memoryId)
    const agentKey = this.getAgentKey(agentId)
    
    await kv.del(memoryKey)
    
    // Remove from agent's list
    const memoryIds = await kv.lrange<string>(agentKey, 0, -1)
    const filteredIds = memoryIds.filter(id => id !== memoryId)
    await kv.del(agentKey)
    if (filteredIds.length > 0) {
      await kv.lpush(agentKey, ...filteredIds)
    }
  }

  async searchMemories(
    agentId: string,
    query: string,
    topK: number = 5
  ): Promise<RecallResult[]> {
    const memories = await this.getMemoriesByAgent(agentId, 1000)
    const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
    
    const results: RecallResult[] = []
    
    for (const memory of memories) {
      const contentLower = memory.content.toLowerCase()
      let matchCount = 0
      
      for (const word of queryWords) {
        if (contentLower.includes(word)) {
          matchCount++
        }
      }
      
      if (matchCount > 0) {
        const similarity = matchCount / queryWords.length
        results.push({ memory, similarity })
      }
    }
    
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  async getStats(agentId: string): Promise<{
    totalMemories: number;
    averageMemoryLength: number;
    memoryTypes: Record<MemoryType, number>;
  }> {
    const memories = await this.getMemoriesByAgent(agentId, 1000)
    
    const memoryTypes = {} as Record<MemoryType, number>
    let totalLength = 0
    
    for (const memory of memories) {
      memoryTypes[memory.type] = (memoryTypes[memory.type] || 0) + 1
      totalLength += memory.content.length
    }
    
    const totalMemories = memories.length
    const averageMemoryLength = totalMemories > 0 ? totalLength / totalMemories : 0
    
    return { totalMemories, averageMemoryLength, memoryTypes }
  }
}

// Singleton instance
export const kvMemoryStorage = new KVMemoryStorage()