import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { kvMemoryStorage } from '@/lib/kv-storage'
import { openaiEmbeddingService } from '@/lib/openai-embeddings'
import { createPharosClient } from '@/lib/pharos-client'
import { RememberRequest, ApiResponse, Memory } from '@/types'
import { Hash } from 'viem'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RememberRequest
    const { agentId, content, type } = body

    // Validate input
    if (!agentId || !content || !type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: agentId, content, type',
      }, { status: 400 })
    }

    // Generate embedding
    const embedding = await openaiEmbeddingService.generateEmbedding(content)
    
    // Generate hash
    const hash = createHash('sha256').update(content).digest('hex')
    
    // Create memory object
    const memory: Memory = {
      id: createHash('sha256').update(Date.now().toString() + Math.random().toString()).digest('hex').slice(0, 32),
      agentId,
      content,
      type,
      hash,
      txHash: null,
      timestamp: Date.now(),
      embedding,
      createdAt: new Date(),
    }

    // Store memory in KV
    await kvMemoryStorage.storeMemory(memory)

    // Try to anchor on Pharos
    let txHash: string | null = null
    try {
      const pharosClient = createPharosClient()
      txHash = await pharosClient.anchorHash(hash as Hash, content)
      
      // Update memory with transaction hash
      memory.txHash = txHash
      await kvMemoryStorage.updateMemory(agentId, memory.id, { txHash })
    } catch (error) {
      console.warn('Failed to anchor on Pharos:', error)
      // Continue even if blockchain anchoring fails
    }

    return NextResponse.json<ApiResponse<{ memory: Memory; txHash: string | null }>>({
      success: true,
      data: {
        memory,
        txHash,
      },
    })
  } catch (error) {
    console.error('Error in remember API:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}