import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import OpenAI from 'openai'
import { kvMemoryStorage } from '@/lib/kv-storage'
import { RememberRequest, ApiResponse, Memory } from '@/types'

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

    return NextResponse.json<ApiResponse<{ memory: Memory }>>({
      success: true,
      data: {
        memory,
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
