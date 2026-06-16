import { createPublicClient, http, Hash } from 'viem'
import { defineChain } from 'viem'

export const pharosTestnet = defineChain({
  id: 688689,
  name: 'Pharos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PHRS',
    symbol: 'PHRS',
  },
  rpcUrls: {
    default: {
      http: ['https://atlantic.dplabs-internal.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PharosScan',
      url: 'https://atlantic.pharosscan.xyz',
    },
  },
})

export const pharosMainnet = defineChain({
  id: 1672,
  name: 'Pharos',
  nativeCurrency: {
    decimals: 18,
    name: 'PHRS',
    symbol: 'PHRS',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.pharos.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'PharosScan',
      url: 'https://pharosscan.xyz',
    },
  },
})

export class NextPharosClient {
  private publicClient

  constructor() {
    const rpcUrl = process.env.PHAROS_RPC_URL || 'https://atlantic.dplabs-internal.com'
    const chainId = process.env.PHAROS_CHAIN_ID ? parseInt(process.env.PHAROS_CHAIN_ID) : 688689

    const chain = chainId === 688689 ? pharosTestnet : pharosMainnet
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    })
  }

  async verifyHash(txHash: Hash, expectedHash: Hash): Promise<boolean> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash })
      const tx = await this.publicClient.getTransaction({ hash: txHash })

      if (!receipt) {
        return false
      }

      const inputData = tx.input.toLowerCase()
      const normalizedExpected = expectedHash.toLowerCase()

      return inputData === normalizedExpected || inputData.endsWith(normalizedExpected.slice(2))
    } catch (error) {
      console.error('Error verifying hash:', error)
      return false
    }
  }

  async getTransactionDetails(txHash: Hash) {
    try {
      const tx = await this.publicClient.getTransaction({ hash: txHash })
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash })
      const block = receipt ? await this.publicClient.getBlock({ blockNumber: receipt.blockNumber }) : null

      return {
        hash: tx.hash,
        blockNumber: receipt?.blockNumber,
        timestamp: block?.timestamp,
        from: tx.from,
        to: tx.to,
        input: tx.input,
        status: receipt?.status,
      }
    } catch (error) {
      console.error('Error getting transaction details:', error)
      return null
    }
  }

}

// Singleton instance
export function createPharosClient(): NextPharosClient {
  return new NextPharosClient()
}
