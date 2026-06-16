import { createPublicClient, createWalletClient, http, Hash, parseEther } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
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
  private walletClient
  private account

  constructor() {
    const privateKey = process.env.PHAROS_PRIVATE_KEY
    const rpcUrl = process.env.PHAROS_RPC_URL || 'https://atlantic.dplabs-internal.com'
    const chainId = process.env.PHAROS_CHAIN_ID ? parseInt(process.env.PHAROS_CHAIN_ID) : 688689
    
    if (!privateKey) {
      throw new Error('PHAROS_PRIVATE_KEY environment variable is required')
    }

    const chain = chainId === 688689 ? pharosTestnet : pharosMainnet
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(rpcUrl),
    })

    this.account = privateKeyToAccount(privateKey as Hash)
    
    this.walletClient = createWalletClient({
      chain,
      transport: http(rpcUrl),
      account: this.account,
    })
  }

  async getBalance(): Promise<bigint> {
    return this.publicClient.getBalance({
      address: this.account.address,
    })
  }

  async anchorHash(hash: Hash, data: string): Promise<Hash> {
    const txHash = await this.walletClient.sendTransaction({
      to: this.account.address,
      value: parseEther('0'),
      data: `0x${hash.slice(2)}`,
    })

    return txHash
  }

  async verifyHash(txHash: Hash, expectedHash: Hash): Promise<boolean> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash })
      const tx = await this.publicClient.getTransaction({ hash: txHash })
      
      if (!receipt) {
        return false
      }

      const inputData = tx.input
      const storedHash = `0x${inputData.slice(10)}`
      
      return storedHash.toLowerCase() === expectedHash.toLowerCase()
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

  getAccountAddress(): string {
    return this.account.address
  }
}

// Singleton instance
export function createPharosClient(): NextPharosClient {
  return new NextPharosClient()
}
