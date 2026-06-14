import OpenAI from 'openai'

export class OpenAIEmbeddingService {
  private openai: OpenAI
  private model = 'text-embedding-3-small'
  
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required')
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: 'float',
      })
      
      return response.data[0].embedding
    } catch (error) {
      console.error('Error generating OpenAI embedding:', error)
      throw error
    }
  }

  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.model,
        input: texts,
        encoding_format: 'float',
      })
      
      return response.data.map(item => item.embedding)
    } catch (error) {
      console.error('Error generating OpenAI embeddings:', error)
      throw error
    }
  }

  getEmbeddingDimensions(): number {
    // text-embedding-3-small has 1536 dimensions
    return 1536
  }
}

// Singleton instance
export const openaiEmbeddingService = new OpenAIEmbeddingService()