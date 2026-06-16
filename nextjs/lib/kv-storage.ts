import { Redis } from '@upstash/redis'
import OpenAI from 'openai'
import { mkdir, readFile, writeFile } from 'fs/promises'
import os from 'os'
import path from 'path'
import { Memory, MemoryType, RecallResult } from '@/types'

// Support both Upstash Redis and Vercel KV environment variables
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

// Check if configured (and not using default template placeholders)
const isConfigured = !!(
  redisUrl &&
  redisToken &&
  redisUrl !== 'your_upstash_redis_url' &&
  redisUrl !== 'your_vercel_kv_url' &&
  redisUrl !== ''
)

// Construct the client only if configured, otherwise use null to trigger a clean error
const redisClient = isConfigured
  ? new Redis({
      url: redisUrl,
      token: redisToken,
    })
  : null

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const KV_PREFIX = 'echomind:'
const fallbackStorePath = path.join(os.tmpdir(), 'echomind-kv-store.json')

async function readFallbackStore(): Promise<Record<string, Memory>> {
  try {
    const raw = await readFile(fallbackStorePath, 'utf8')
    const parsed = JSON.parse(raw) as Record<string, Memory>
    return parsed ?? {}
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return {}
    }
    throw error
  }
}

async function writeFallbackStore(store: Record<string, Memory>): Promise<void> {
  await mkdir(path.dirname(fallbackStorePath), { recursive: true })
  await writeFile(fallbackStorePath, JSON.stringify(store), 'utf8')
}

export class KVMemoryStorage {
  private hasRedis(): boolean {
    return Boolean(redisClient)
  }

  private getKey(agentId: string, memoryId: string): string {
    return `${KV_PREFIX}${agentId}:${memoryId}`
  }

  private getAgentKey(agentId: string): string {
    return `${KV_PREFIX}agent:${agentId}:memories`
  }

  private async generateEmbedding(text: string): Promise<number[] | null> {
    if (!openaiClient || !text.trim()) {
      return null
    }

    const response = await openaiClient.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0]?.embedding ?? null
  }

  private cosineSimilarity(left: number[], right: number[]): number {
    if (left.length === 0 || right.length === 0 || left.length !== right.length) {
      return 0
    }

    let dot = 0
    let leftMagnitude = 0
    let rightMagnitude = 0

    for (let index = 0; index < left.length; index += 1) {
      dot += left[index] * right[index]
      leftMagnitude += left[index] * left[index]
      rightMagnitude += right[index] * right[index]
    }

    if (leftMagnitude === 0 || rightMagnitude === 0) {
      return 0
    }

    return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude))
  }

  async storeMemory(memory: Memory): Promise<void> {
    if (!this.hasRedis()) {
      const store = await readFallbackStore()
      store[this.getKey(memory.agentId, memory.id)] = memory
      await writeFallbackStore(store)
      return
    }

    const redis = redisClient as Redis
    const memoryKey = this.getKey(memory.agentId, memory.id)
    const agentKey = this.getAgentKey(memory.agentId)

    // Store memory with TTL (30 days)
    await redis.set(memoryKey, JSON.stringify(memory), { ex: 60 * 60 * 24 * 30 })

    // Store memory ID in a list for the agent
    await redis.lpush(agentKey, memory.id)
  }

  async getMemory(agentId: string, memoryId: string): Promise<Memory | null> {
    if (!this.hasRedis()) {
      const store = await readFallbackStore()
      return store[this.getKey(agentId, memoryId)] ?? null
    }

    const redis = redisClient as Redis
    const memoryKey = this.getKey(agentId, memoryId)
    const data = await redis.get<any>(memoryKey)
    
    if (!data) return null
    if (typeof data === 'object') {
      return data as Memory
    }
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to parse memory JSON:', data, error)
      return data as unknown as Memory
    }
  }

  async getMemoriesByAgent(agentId: string, limit: number = 100): Promise<Memory[]> {
    if (!this.hasRedis()) {
      const store = await readFallbackStore()
      return Object.values(store)
        .filter(memory => memory.agentId === agentId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit)
    }

    const redis = redisClient as Redis
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
    const memory = await this.getMemory(agentId, memoryId)
    if (!memory) throw new Error(`Memory not found: ${memoryId}`)
    
    const updatedMemory = { ...memory, ...updates }
    if (!this.hasRedis()) {
      const store = await readFallbackStore()
      store[this.getKey(agentId, memoryId)] = updatedMemory
      await writeFallbackStore(store)
      return
    }

    const redis = redisClient as Redis
    const memoryKey = this.getKey(agentId, memoryId)

    await redis.set(memoryKey, JSON.stringify(updatedMemory), { ex: 60 * 60 * 24 * 30 })
  }

  async findMemoryById(memoryId: string, preferredAgentId?: string): Promise<Memory | null> {
    if (!this.hasRedis()) {
      const store = await readFallbackStore()
      for (const memory of Object.values(store)) {
        if (memory.id === memoryId) {
          return memory
        }
      }
    }

    const agentCandidates = [
      preferredAgentId,
      'pharos-agent',
    ].filter((agentId): agentId is string => Boolean(agentId))

    for (const agentId of agentCandidates) {
      const memory = await this.getMemory(agentId, memoryId)
      if (memory) {
        return memory
      }
    }

    return null
  }

  async deleteMemory(agentId: string, memoryId: string): Promise<void> {
    if (!this.hasRedis()) {
      const store = await readFallbackStore()
      delete store[this.getKey(agentId, memoryId)]
      await writeFallbackStore(store)
      return
    }

    const redis = redisClient as Redis
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
    const semanticQueryEmbedding = await this.generateEmbedding(query)

    if (semanticQueryEmbedding) {
      const semanticResults: RecallResult[] = []

      for (const memory of memories) {
        let memoryEmbedding = memory.embedding

        if (!memoryEmbedding) {
          memoryEmbedding = await this.generateEmbedding(memory.content)
          if (memoryEmbedding) {
            await this.updateMemory(agentId, memory.id, { embedding: memoryEmbedding })
          }
        }

        if (!memoryEmbedding) {
          continue
        }

        const similarity = this.cosineSimilarity(semanticQueryEmbedding, memoryEmbedding)
        if (similarity > 0) {
          semanticResults.push({ memory: { ...memory, embedding: memoryEmbedding }, similarity })
        }
      }

      if (semanticResults.length > 0) {
        return semanticResults
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, topK)
      }
    }

    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^a-z0-9]/g, ''))
      .filter(word => word.length > 2)

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
