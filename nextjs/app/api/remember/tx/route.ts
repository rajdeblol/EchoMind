import { NextRequest, NextResponse } from 'next/server'
import { kvMemoryStorage } from '@/lib/kv-storage'
import { ApiResponse, Memory } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Pick<Memory, 'agentId' | 'id' | 'txHash'>
    const { agentId, id, txHash } = body

    if (!agentId || !id || !txHash) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: agentId, id, txHash',
      }, { status: 400 })
    }

    await kvMemoryStorage.updateMemory(agentId, id, { txHash })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { agentId, id, txHash },
    })
  } catch (error) {
    console.error('Error updating memory txHash:', error)

    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}
