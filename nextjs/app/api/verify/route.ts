import { NextRequest, NextResponse } from 'next/server'
import { kvMemoryStorage } from '@/lib/kv-storage'
import { createPharosClient } from '@/lib/pharos-client'
import { VerifyRequest, ApiResponse, VerifyResult } from '@/types'
import { Hash } from 'viem'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as VerifyRequest
    const { memoryId, txHash, agentId } = body

    // Validate input
    if (!memoryId || !txHash) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: memoryId, txHash',
      }, { status: 400 })
    }

    // Look up the memory using the supplied agent if present, otherwise
    // fall back to the known dashboard/demo agents.
    const memory = await kvMemoryStorage.findMemoryById(memoryId, agentId)
    
    if (!memory) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Memory not found',
      }, { status: 404 })
    }

    // Verify hash on Pharos
    let valid = false
    let txDetails: any = null

    try {
      const pharosClient = createPharosClient()
      valid = await pharosClient.verifyHash(txHash as Hash, memory.hash as Hash)
      txDetails = await pharosClient.getTransactionDetails(txHash as Hash)
    } catch (error) {
      console.error('Real on-chain verification failed:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify transaction on Pharos',
      }, { status: 500 })
    }

    const result: VerifyResult = {
      valid,
      memoryId,
      txHash,
      onChainHash: txDetails?.input ? txDetails.input : '',
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
