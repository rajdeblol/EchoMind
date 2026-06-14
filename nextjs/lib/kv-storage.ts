import { Redis } from '@upstash/redis'
import { Memory, MemoryType, RecallResult } from '@/types'

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
})

const KV_PREFIX = 'echomind:'

export class KVMemoryStorage {
  private redis: Redis

  constructor() {
    this.redis = redis
  }

  private getKey(agentId: string, memoryId: string): string {
    return `${KV_PREFIX}${agentId}:${memoryId}`
  }

  private getAgentKey(agentId: string): string {
    return `${KV_PREFIX}agent:${agentId}:memories`
  }

  async storeMemory(memory: Memory): Promise<void> {
    // Store individual memory
    const memoryKey = this.getKey(memory.agentId, memory.id)
    await this.redis.set(memoryKey, JSON.stringify(memory), { ex: 60 * 60 * 24 * 30 }) // 30 days TTL

    // Add to agent's memory list
    const agentKey = this.getAgentKey(memory.agentId)
    await this.redis.zadd(agentKey, { score: memory.timestamp, member: memory.id })
  }

  async getMemory(agentId: string, memoryId: string): Promise<Memory | null> {
    const memoryKey = this.getKey(agentId, memoryId)
    const data = await this.redis.get<string>(memoryKey)
    
    if (!data) {
      return null
    }
    
    return JSON.parse(data)
  }

  async getMemoriesByAgent(agentId: string, limit: number = 100): Promise<Memory[]> {
    const agentKey = this.getAgentKey(agentId)
    
    // Get memory IDs sorted by timestamp (newest first)
    const memoryIds = await this.redis.zrange<string>(agentKey, 0, limit - 1, { rev: true })
    
    // Fetch all memories
    const memories: Memory[] = []
    for (const memoryId of memoryIds) {
      const memory = await this.getMemory(agentId, memoryId)
      if (memory) {
        memories.push(memory)
      }
    }
    
    return memories
  }

  async updateMemory(agentId: string, memoryId: string, updates: Partial<Memory>): Promise<void> {
    const memory = await this.getMemory(agentId, memoryId)
    
    if (!memory) {
      throw new Error(`Memory not found: ${memoryId}`)
    }
    
    const updatedMemory = { ...memory, ...updates }
    const memoryKey = this.getKey(agentId, memoryId)
    
    await this.redis.set(memoryKey, JSON.stringify(updatedMemory), { ex: 60 * 60 * 24 * 30 })
  }

  async deleteMemory(agentId: string, memoryId: string): Promise<void> {
    const memoryKey = this.getKey(agentId, memoryId)
    const agentKey = this.getAgentKey(agentId)
    
    await this.redis.del(memoryKey)
    await this.redis.zrem(agentKey, memoryId)
  }

  async searchMemories(
    agentId: string,
    queryEmbedding: number[],
    topK: number = 5
  ): Promise<RecallResult[]> {
    const memories = await this.getMemoriesByAgent(agentId, 1000)
    const results: RecallResult[] = []
    
    for (const memory of memories) {
      if (!memory.embedding) continue
      
      const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding)
      results.push({ memory, similarity })
    }
    
    // Sort by similarity (highest first) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0
    }
    
    let dotProduct = 0
    let normA = 0
    let normB = 0
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }
    
    if (normA === 0 || normB === 0) {
      return 0
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
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
    
    return {
      totalMemories,
      averageMemoryLength,
      memoryTypes,
    }
  }
}

// Singleton instance
export const kvMemoryStorage = new KVMemoryStorage()