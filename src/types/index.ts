export type MemoryType = 'text' | 'image' | 'audio' | 'code' | 'event';

export interface Memory {
  id: string;
  agentId: string;
  content: string;
  type: MemoryType;
  hash: string;
  txHash: string | null;
  timestamp: number;
  embedding: number[];
  createdAt: Date;
}

export interface StoredMemory extends Omit<Memory, 'embedding'> {
  embedding: Buffer; // SQLite stores as BLOB
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

export interface RememberParams {
  agentId: string;
  content: string;
  type: MemoryType;
}

export interface RecallParams {
  agentId: string;
  query: string;
  topK?: number;
}

export interface VerifyParams {
  memoryId: string;
  txHash: string;
}