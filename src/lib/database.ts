import Database from 'better-sqlite3';
import { Memory, StoredMemory, MemoryType, RecallResult } from '../types/index.js';
import { createHash } from 'crypto';

export class MemoryDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './echomind.db') {
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    // Create memories table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS memories (
        id TEXT PRIMARY KEY,
        agentId TEXT NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        hash TEXT NOT NULL,
        txHash TEXT,
        timestamp INTEGER NOT NULL,
        embedding BLOB NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(hash)
      )
    `);

    // Create indexes for efficient querying
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_agent_id ON memories(agentId);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON memories(timestamp);
      CREATE INDEX IF NOT EXISTS idx_type ON memories(type);
      CREATE INDEX IF NOT EXISTS idx_tx_hash ON memories(txHash);
    `);
  }

  private bufferToArray(buffer: Buffer): number[] {
    return Array.from(new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4));
  }

  private arrayToBuffer(array: number[]): Buffer {
    const floatArray = new Float32Array(array);
    return Buffer.from(floatArray.buffer);
  }

  private generateId(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex')
      .slice(0, 32);
  }

  private computeHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }

  async storeMemory(
    agentId: string,
    content: string,
    type: MemoryType,
    embedding: number[],
    txHash?: string
  ): Promise<Memory> {
    const id = this.generateId();
    const hash = this.computeHash(content);
    const timestamp = Date.now();
    const embeddingBuffer = this.arrayToBuffer(embedding);

    const stmt = this.db.prepare(`
      INSERT INTO memories (id, agentId, content, type, hash, txHash, timestamp, embedding)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, agentId, content, type, hash, txHash || null, timestamp, embeddingBuffer);

    return {
      id,
      agentId,
      content,
      type,
      hash,
      txHash: txHash || null,
      timestamp,
      embedding,
      createdAt: new Date(),
    };
  }

  async getMemory(id: string): Promise<Memory | null> {
    const stmt = this.db.prepare('SELECT * FROM memories WHERE id = ?');
    const row = stmt.get(id) as StoredMemory | undefined;

    if (!row) {
      return null;
    }

    return {
      ...row,
      embedding: this.bufferToArray(row.embedding),
      createdAt: new Date(row.createdAt),
    };
  }

  async getMemoriesByAgent(agentId: string, limit: number = 100): Promise<Memory[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM memories 
      WHERE agentId = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `);

    const rows = stmt.all(agentId, limit) as StoredMemory[];
    return rows.map(row => ({
      ...row,
      embedding: this.bufferToArray(row.embedding),
      createdAt: new Date(row.createdAt),
    }));
  }

  async updateTxHash(id: string, txHash: string): Promise<void> {
    const stmt = this.db.prepare('UPDATE memories SET txHash = ? WHERE id = ?');
    stmt.run(txHash, id);
  }

  async semanticSearch(
    agentId: string,
    queryEmbedding: number[],
    topK: number = 5
  ): Promise<RecallResult[]> {
    // Get all memories for this agent
    const memories = await this.getMemoriesByAgent(agentId, 1000);
    
    // Calculate cosine similarity for each memory
    const results: RecallResult[] = [];
    
    for (const memory of memories) {
      const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding);
      results.push({ memory, similarity });
    }
    
    // Sort by similarity (highest first) and return top K
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      return 0;
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  async getMemoryByHash(hash: string): Promise<Memory | null> {
    const stmt = this.db.prepare('SELECT * FROM memories WHERE hash = ?');
    const row = stmt.get(hash) as StoredMemory | undefined;

    if (!row) {
      return null;
    }

    return {
      ...row,
      embedding: this.bufferToArray(row.embedding),
      createdAt: new Date(row.createdAt),
    };
  }

  async deleteMemory(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM memories WHERE id = ?');
    stmt.run(id);
  }

  async getStats(agentId?: string): Promise<{
    totalMemories: number;
    averageMemoryLength: number;
    memoryTypes: Record<MemoryType, number>;
  }> {
    let query = 'SELECT type, COUNT(*) as count, AVG(LENGTH(content)) as avgLength FROM memories';
    const params: any[] = [];
    
    if (agentId) {
      query += ' WHERE agentId = ?';
      params.push(agentId);
    }
    
    query += ' GROUP BY type';
    
    const stmt = this.db.prepare(query);
    const rows = stmt.all(...params) as Array<{ type: MemoryType; count: number; avgLength: number }>;
    
    const memoryTypes = {} as Record<MemoryType, number>;
    let totalMemories = 0;
    let totalLength = 0;
    
    for (const row of rows) {
      memoryTypes[row.type] = row.count;
      totalMemories += row.count;
      totalLength += row.count * row.avgLength;
    }
    
    const averageMemoryLength = totalMemories > 0 ? totalLength / totalMemories : 0;
    
    return {
      totalMemories,
      averageMemoryLength,
      memoryTypes,
    };
  }

  close(): void {
    this.db.close();
  }
}