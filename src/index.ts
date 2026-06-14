import { PharosClient, PharosConfig } from './lib/pharos.js';
import { MemoryDatabase } from './lib/database.js';
import { EmbeddingService } from './lib/embeddings.js';
import { 
  Memory, 
  MemoryType, 
  RecallResult, 
  VerifyResult,
  RememberParams,
  RecallParams,
  VerifyParams
} from './types/index.js';
import { Hash } from 'viem';
import { config } from 'dotenv';
import { createHash } from 'crypto';

// Load environment variables
config();

export class EchoMind {
  private pharosClient: PharosClient;
  private memoryDb: MemoryDatabase;
  private embeddingService: EmbeddingService | null = null;
  
  constructor(config: PharosConfig, dbPath?: string) {
    this.pharosClient = new PharosClient(config);
    this.memoryDb = new MemoryDatabase(dbPath);
  }

  private async ensureEmbeddingService(): Promise<EmbeddingService> {
    if (!this.embeddingService) {
      this.embeddingService = await EmbeddingService.getInstance();
    }
    return this.embeddingService;
  }

  async remember(params: RememberParams): Promise<{ memory: Memory; txHash: string | null }> {
    const { agentId, content, type } = params;
    
    try {
      // Generate embedding for the content
      const embeddingService = await this.ensureEmbeddingService();
      const embedding = await embeddingService.generateEmbedding(content);
      
      // Generate hash for the content
      const hash = createHash('sha256').update(content).digest('hex') as Hash;
      
      // Store memory locally first
      const memory = await this.memoryDb.storeMemory(
        agentId,
        content,
        type,
        embedding
      );
      
      // Anchor hash on Pharos
      let txHash: string | null = null;
      try {
        txHash = await this.pharosClient.anchorHash(hash, content);
        
        // Update memory with transaction hash
        await this.memoryDb.updateTxHash(memory.id, txHash);
        memory.txHash = txHash;
        
        console.log(`Memory anchored on Pharos: ${txHash}`);
        console.log(`Explorer: https://atlantic.pharosscan.xyz/tx/${txHash}`);
      } catch (error) {
        console.warn('Failed to anchor hash on Pharos:', error);
        // Memory is still stored locally even if blockchain anchoring fails
      }
      
      return { memory, txHash };
    } catch (error) {
      console.error('Error in remember:', error);
      throw error;
    }
  }

  async recall(params: RecallParams): Promise<RecallResult[]> {
    const { agentId, query, topK = 5 } = params;
    
    try {
      // Generate embedding for the query
      const embeddingService = await this.ensureEmbeddingService();
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      
      // Perform semantic search
      const results = await this.memoryDb.semanticSearch(
        agentId,
        queryEmbedding,
        topK
      );
      
      return results;
    } catch (error) {
      console.error('Error in recall:', error);
      throw error;
    }
  }

  async verify(params: VerifyParams): Promise<VerifyResult> {
    const { memoryId, txHash } = params;
    
    try {
      // Get memory from database
      const memory = await this.memoryDb.getMemory(memoryId);
      
      if (!memory) {
        throw new Error(`Memory not found: ${memoryId}`);
      }
      
      // Verify hash on-chain
      const valid = await this.pharosClient.verifyHash(
        txHash as Hash,
        memory.hash as Hash
      );
      
      // Get transaction details
      const txDetails = await this.pharosClient.getTransactionDetails(txHash as Hash);
      
      return {
        valid,
        memoryId,
        txHash,
        onChainHash: txDetails?.input ? `0x${txDetails.input.slice(10)}` : '',
        localHash: memory.hash,
        blockNumber: txDetails?.blockNumber ? Number(txDetails.blockNumber) : null,
        timestamp: txDetails?.timestamp ? Number(txDetails.timestamp) : null,
      };
    } catch (error) {
      console.error('Error in verify:', error);
      throw error;
    }
  }

  // Additional utility methods

  async getAgentMemories(agentId: string, limit: number = 100): Promise<Memory[]> {
    return this.memoryDb.getMemoriesByAgent(agentId, limit);
  }

  async getMemoryById(memoryId: string): Promise<Memory | null> {
    return this.memoryDb.getMemory(memoryId);
  }

  async getAgentStats(agentId?: string): Promise<{
    totalMemories: number;
    averageMemoryLength: number;
    memoryTypes: Record<MemoryType, number>;
  }> {
    return this.memoryDb.getStats(agentId);
  }

  async getPharosBalance(): Promise<bigint> {
    return this.pharosClient.getBalance();
  }

  getPharosAddress(): string {
    return this.pharosClient.getAccountAddress();
  }

  async cleanup(): Promise<void> {
    this.memoryDb.close();
    if (this.embeddingService) {
      await this.embeddingService.cleanup();
    }
  }
}

// Factory function for easy instantiation
export function createEchoMind(): EchoMind {
  const privateKey = process.env.PHAROS_PRIVATE_KEY;
  const rpcUrl = process.env.PHAROS_RPC_URL || 'https://atlantic.dplabs-internal.com';
  const chainId = process.env.PHAROS_CHAIN_ID ? parseInt(process.env.PHAROS_CHAIN_ID) : 688689;
  const dbPath = process.env.DB_PATH || './echomind.db';

  if (!privateKey) {
    throw new Error('PHAROS_PRIVATE_KEY environment variable is required');
  }

  return new EchoMind({
    chainId,
    rpcUrl,
    privateKey,
    useTestnet: chainId === 688689,
  }, dbPath);
}