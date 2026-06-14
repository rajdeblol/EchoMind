import { NextRequest, NextResponse } from 'next/server'
import { kvMemoryStorage } from '@/lib/kv-storage'
import { createPharosClient } from '@/lib/pharos-client'
import { VerifyRequest, ApiResponse, VerifyResult } from '@/types'
import { Hash } from 'viem'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VerifyRequest
    const { memoryId, txHash } = body

    // Validate input
    if (!memoryId || !txHash) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: memoryId, txHash',
      }, { status: 400 })
    }

    // Get memory from storage
    // Note: We need agentId to get memory, but we don't have it in the request
    // For this demo, we'll use a default agent or search across all agents
    // In production, you'd want to store memoryId -> agentId mapping
    
    // For now, we'll assume memory is found
    const memory = await kvMemoryStorage.getMemory('demo-agent', memoryId)
    
    if (!memory) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Memory not found',
      }, { status: 404 })
    }

    // Verify hash on Pharos
    const pharosClient = createPharosClient()
    const valid = await pharosClient.verifyHash(txHash as Hash, memory.hash as Hash)
    
    // Get transaction details
    const txDetails = await pharosClient.getTransactionDetails(txHash as Hash)

    const result: VerifyResult = {
      valid,
      memoryId,
      txHash,
      onChainHash: txDetails?.input ? `0x${txDetails.input.slice(10)}` : '',
      localHash: memory.hash,
      blockNumber: txDetails?.blockNumber ? Number(txDetails.blockNumber) : null,
      timestamp: txDetails?.timestamp ? Number(txDetails.timestamp) : null,
    }

    return NextResponse.json<ApiResponse<VerifyResult>>({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error('Error in verify API:', error)
    
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}