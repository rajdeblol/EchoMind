import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

export class EmbeddingService {
  private static instance: EmbeddingService;
  private extractor: FeatureExtractionPipeline | null = null;
  private modelName = 'Xenova/all-MiniLM-L6-v2';
  private initialized = false;

  private constructor() {}

  static async getInstance(): Promise<EmbeddingService> {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
      await EmbeddingService.instance.initialize();
    }
    return EmbeddingService.instance;
  }

  private async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.extractor = await pipeline(
        'feature-extraction',
        this.modelName,
        { quantized: true }
      );
      this.initialized = true;
      console.log(`Embedding service initialized with model: ${this.modelName}`);
    } catch (error) {
      console.error('Failed to initialize embedding service:', error);
      throw error;
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.extractor) {
      throw new Error('Embedding service not initialized');
    }

    try {
      const result = await this.extractor(text, {
        pooling: 'mean',
        normalize: true,
      });
      
      // Convert tensor to array
      return Array.from(result.data);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (!this.extractor) {
      throw new Error('Embedding service not initialized');
    }

    try {
      const embeddings: number[][] = [];
      
      for (const text of texts) {
        const embedding = await this.generateEmbedding(text);
        embeddings.push(embedding);
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw error;
    }
  }

  async generateBatchEmbeddings(texts: string[], batchSize: number = 32): Promise<number[][]> {
    if (!this.extractor) {
      throw new Error('Embedding service not initialized');
    }

    try {
      const embeddings: number[][] = [];
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchEmbeddings = await this.generateEmbeddings(batch);
        embeddings.push(...batchEmbeddings);
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating batch embeddings:', error);
      throw error;
    }
  }

  getEmbeddingDimensions(): number {
    // all-MiniLM-L6-v2 has 384 dimensions
    return 384;
  }

  isInitialized(): boolean {
    return this.initialized && this.extractor !== null;
  }

  async cleanup(): Promise<void> {
    // Clean up resources if needed
    this.extractor = null;
    this.initialized = false;
  }
}