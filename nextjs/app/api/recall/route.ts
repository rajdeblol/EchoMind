import { NextRequest, NextResponse } from 'next/server'
import { kvMemoryStorage } from '@/lib/kv-storage'
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

    // Perform keyword-based search (no embeddings needed)
    const results = await kvMemoryStorage.searchMemories(agentId, query, topK)

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