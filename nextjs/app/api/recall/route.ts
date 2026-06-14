import { NextRequest, NextResponse } from 'next/server'
import { kvMemoryStorage } from '@/lib/kv-storage'
import { openaiEmbeddingService } from '@/lib/openai-embeddings'
import { RecallRequest, ApiResponse, RecallResult } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RecallRequest
    const { agentId, query, topK = 5 } = body

    // Validate input
    if (!agentId || !query) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: agentId, query',
      }, { status: 400 })
    }

    // Generate embedding for query
    const queryEmbedding = await openaiEmbeddingService.generateEmbedding(query)
    
    // Perform semantic search
    const results = await kvMemoryStorage.searchMemories(agentId, queryEmbedding, topK)

    return NextResponse.json<ApiResponse<RecallResult[]>>({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Error in recall API:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}