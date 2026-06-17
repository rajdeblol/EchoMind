import { Address, Hex, createWalletClient, custom } from 'viem'
import { pharosTestnet } from '@/lib/pharos-client'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<any>
}

export function getEthereumProvider(): EthereumProvider | null {
  if (typeof window === 'undefined') {
    return null
  }

  const ethereum = (window as any).ethereum
  if (!ethereum) return null

  // Prioritize MetaMask if multiple providers exist (common in Brave browser)
  if (ethereum.providers?.length) {
    const metaMask = ethereum.providers.find((p: any) => p.isMetaMask)
    if (metaMask) return metaMask
  }

  return ethereum
}

export async function ensurePharosTestnet(ethereum: EthereumProvider): Promise<void> {
  const currentChainId = await ethereum.request({ method: 'eth_chainId' }) as string
  const targetChainId = `0x${pharosTestnet.id.toString(16)}`

  if (currentChainId?.toLowerCase() === targetChainId.toLowerCase()) {
    return
  }

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChainId }],
    })
  } catch (error: any) {
    // Many wallets (like Brave) do not return the standard 4902 error code.
    // So we fallback to adding the chain if switching fails for any reason.
    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: targetChainId,
          chainName: pharosTestnet.name,
          nativeCurrency: pharosTestnet.nativeCurrency,
          rpcUrls: pharosTestnet.rpcUrls.default.http,
          blockExplorerUrls: [pharosTestnet.blockExplorers.default.url],
        }],
      })
    } catch (addError) {
      console.error('Failed to add chain:', addError)
      throw error // Throw the original error if adding also fails
    }
  }
}

export async function sendPharosAnchorTx(address: Address, hash: string): Promise<Hex> {
  const ethereum = getEthereumProvider()

  if (!ethereum) {
    throw new Error('No EVM wallet detected. Please install MetaMask or another browser wallet extension.')
  }

  await ensurePharosTestnet(ethereum)

  const walletClient = createWalletClient({
    chain: pharosTestnet,
    transport: custom(ethereum),
  })

  return walletClient.sendTransaction({
    account: address,
    to: address,
    value: BigInt(0),
    data: (`0x${hash}` as Hex),
  })
}
