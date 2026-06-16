import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import OpenAI from 'openai'
import { kvMemoryStorage } from '@/lib/kv-storage'
import { createPharosClient } from '@/lib/pharos-client'
import { RememberRequest, ApiResponse, Memory } from '@/types'
import { Hash } from 'viem'

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

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

    // Generate hash
    const hash = createHash('sha256').update(content).digest('hex')
    let embedding: number[] | null = null

    if (openaiClient) {
      try {
        const response = await openaiClient.embeddings.create({
          model: 'text-embedding-3-small',
          input: content,
        })

        embedding = response.data[0]?.embedding ?? null
      } catch (error) {
        console.warn('Embedding generation failed, continuing without embedding:', error)
      }
    }
    
    // Create memory object (no embedding needed)
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
    } catch (error) {
      console.error('Failed to anchor on Pharos:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to anchor memory on Pharos',
      }, { status: 500 })
    }

    // Update memory with real transaction hash
    memory.txHash = txHash
    await kvMemoryStorage.updateMemory(agentId, memory.id, { txHash })

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
