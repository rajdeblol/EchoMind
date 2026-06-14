import { Redis } from '@upstash/redis'
import { Memory, MemoryType, RecallResult } from '@/types'

// Check if Upstash Redis is properly configured (and not just placeholder text)
const isConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  process.env.UPSTASH_REDIS_REST_URL !== 'your_upstash_redis_url' &&
  process.env.UPSTASH_REDIS_REST_URL !== ''
)

// Construct the client only if configured, otherwise use null to trigger a clean error
const redisClient = isConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

const KV_PREFIX = 'echomind:'

export class KVMemoryStorage {
  private getRedis(): Redis {
    if (!redisClient) {
      throw new Error(
        'Upstash Redis is not configured. Please set the UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables in your Vercel Project Settings or local .env file.'
      )
    }
    return redisClient
  }

  private getKey(agentId: string, memoryId: string): string {
    return `${KV_PREFIX}${agentId}:${memoryId}`
  }

  private getAgentKey(agentId: string): string {
    return `${KV_PREFIX}agent:${agentId}:memories`
  }

  async storeMemory(memory: Memory): Promise<void> {
    const redis = this.getRedis()
    const memoryKey = this.getKey(memory.agentId, memory.id)
    const agentKey = this.getAgentKey(memory.agentId)
    
    // Store memory with TTL (30 days)
    await redis.set(memoryKey, JSON.stringify(memory), { ex: 60 * 60 * 24 * 30 })
    
    // Store memory ID in a list for the agent
    await redis.lpush(agentKey, memory.id)
  }

  async getMemory(agentId: string, memoryId: string): Promise<Memory | null> {
    const redis = this.getRedis()
    const memoryKey = this.getKey(agentId, memoryId)
    const data = await redis.get<string>(memoryKey)
    
    if (!data) return null
    return JSON.parse(data)
  }

  async getMemoriesByAgent(agentId: string, limit: number = 100): Promise<Memory[]> {
    const redis = this.getRedis()
    const agentKey = this.getAgentKey(agentId)
    
    // Get memory IDs from the list
    const memoryIds = await redis.lrange<string>(agentKey, 0, limit - 1)
    
    // Fetch all memories
    const memories: Memory[] = []
    for (const memoryId of memoryIds) {
      const memory = await this.getMemory(agentId, memoryId)
      if (memory) memories.push(memory)
    }
    
    return memories
  }

  async updateMemory(agentId: string, memoryId: string, updates: Partial<Memory>): Promise<void> {
    const redis = this.getRedis()
    const memory = await this.getMemory(agentId, memoryId)
    if (!memory) throw new Error(`Memory not found: ${memoryId}`)
    
    const updatedMemory = { ...memory, ...updates }
    const memoryKey = this.getKey(agentId, memoryId)
    
    await redis.set(memoryKey, JSON.stringify(updatedMemory), { ex: 60 * 60 * 24 * 30 })
  }

  async deleteMemory(agentId: string, memoryId: string): Promise<void> {
    const redis = this.getRedis()
    const memoryKey = this.getKey(agentId, memoryId)
    const agentKey = this.getAgentKey(agentId)
    
    await redis.del(memoryKey)
    
    // Remove from agent's list
    const memoryIds = await redis.lrange<string>(agentKey, 0, -1)
    const filteredIds = memoryIds.filter(id => id !== memoryId)
    await redis.del(agentKey)
    if (filteredIds.length > 0) {
      await redis.lpush(agentKey, ...filteredIds)
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