import { createPublicClient, createWalletClient, http, Hash, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';

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
});

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
});

export interface PharosConfig {
  chainId: number;
  rpcUrl: string;
  privateKey: string;
  useTestnet?: boolean;
}

export class PharosClient {
  private publicClient;
  private walletClient;
  private account;

  constructor(config: PharosConfig) {
    const chain = config.useTestnet !== false ? pharosTestnet : pharosMainnet;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http(config.rpcUrl),
    });

    this.account = privateKeyToAccount(config.privateKey as Hash);
    
    this.walletClient = createWalletClient({
      chain,
      transport: http(config.rpcUrl),
      account: this.account,
    });
  }

  async getBalance(): Promise<bigint> {
    return this.publicClient.getBalance({
      address: this.account.address,
    });
  }

  async anchorHash(hash: Hash, data: string): Promise<Hash> {
    // In Pharos, we can store data in calldata
    // For simplicity, we'll send a transaction with the hash as data
    const txHash = await this.walletClient.sendTransaction({
      to: this.account.address, // Sending to self
      value: parseEther('0'),
      data: `0x${hash.slice(2)}`, // Use hash as calldata
    });

    return txHash;
  }

  async verifyHash(txHash: Hash, expectedHash: Hash): Promise<boolean> {
    try {
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash });
      
      if (!receipt) {
        return false;
      }

      // Extract hash from transaction input data
      const inputData = receipt.transaction.input;
      const storedHash = `0x${inputData.slice(10)}`; // Remove 0x prefix and function selector
      
      return storedHash.toLowerCase() === expectedHash.toLowerCase();
    } catch (error) {
      console.error('Error verifying hash:', error);
      return false;
    }
  }

  async getTransactionDetails(txHash: Hash) {
    try {
      const tx = await this.publicClient.getTransaction({ hash: txHash });
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash });
      const block = receipt ? await this.publicClient.getBlock({ blockNumber: receipt.blockNumber }) : null;

      return {
        hash: tx.hash,
        blockNumber: receipt?.blockNumber,
        timestamp: block?.timestamp,
        from: tx.from,
        to: tx.to,
        input: tx.input,
        status: receipt?.status,
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }

  getAccountAddress(): string {
    return this.account.address;
  }
}