export type MemoryType = 'text' | 'image' | 'audio' | 'code' | 'event';

export interface Memory {
  id: string;
  agentId: string;
  content: string;
  type: MemoryType;
  hash: string;
  txHash: string | null;
  timestamp: number;
  embedding: null; // No embeddings used
  createdAt: Date;
}

export interface RecallResult {
  memory: Memory;
  similarity: number;
}

export interface VerifyResult {
  valid: boolean;
  memoryId: string;
  txHash: string;
  onChainHash: string;
  localHash: string;
  blockNumber: number | null;
  timestamp: number | null;
}

export interface RememberRequest {
  agentId: string;
  content: string;
  type: MemoryType;
}

export interface RecallRequest {
  agentId: string;
  query: string;
  topK?: number;
}

export interface VerifyRequest {
  memoryId: string;
  txHash: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}