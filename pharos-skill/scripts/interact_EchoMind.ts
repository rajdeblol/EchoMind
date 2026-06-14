// Install: npm install viem
// Run: PRIVATE_KEY=your_private_key npx tsx pharos-skill/scripts/interact_EchoMind.ts

import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain,
  toHex,
  keccak256,
  encodePacked,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

// ============================================================
// Network Configuration (Pharos Atlantic Testnet)
// ============================================================

const RPC_URL = "https://atlantic.dplabs-internal.com";
const CHAIN_ID = 688689;

const chain = defineChain({
  id: CHAIN_ID,
  name: "Pharos Atlantic Testnet",
  nativeCurrency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
  rpcUrls: {
    default: { http: [RPC_URL] },
  },
  blockExplorers: {
    default: { name: "PharosScan", url: "https://atlantic.pharosscan.xyz" },
  },
});

// ============================================================
// Helpers
// ============================================================

function getPrivateKey(): `0x${string}` {
  const key = process.env.PRIVATE_KEY;
  if (!key) {
    console.error("❌ PRIVATE_KEY environment variable is not set.");
    console.error("   export PRIVATE_KEY=your_private_key_here");
    process.exit(1);
  }
  return (key.startsWith("0x") ? key : `0x${key}`) as `0x${string}`;
}

async function getClients() {
  try {
    const account = privateKeyToAccount(getPrivateKey());
    const publicClient = createPublicClient({ chain, transport: http(RPC_URL) });
    const walletClient = createWalletClient({ account, chain, transport: http(RPC_URL) });
    await publicClient.getChainId();
    return { publicClient, walletClient, account };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to connect to RPC:", RPC_URL, "Reason:", message);
    throw error;
  }
}

// ============================================================
// EchoMind Skill Methods
// ============================================================

/**
 * remember() - Anchor a memory hash on Pharos chain as calldata.
 * Sends a 0-value tx to self with keccak256(agentId+content+timestamp) as calldata.
 */
async function remember(
  publicClient: Awaited<ReturnType<typeof getClients>>["publicClient"],
  walletClient: Awaited<ReturnType<typeof getClients>>["walletClient"],
  account: Awaited<ReturnType<typeof getClients>>["account"],
  agentId: string,
  content: string,
  memoryType: "decision" | "interaction" | "outcome" | "preference"
) {
  const timestamp = BigInt(Date.now());
  const memoryHash = keccak256(
    encodePacked(["string", "string", "uint256"], [agentId, content, timestamp])
  );

  console.log(`\n📤 remember() — anchoring memory on Pharos...`);
  console.log(`   Agent ID    : ${agentId}`);
  console.log(`   Type        : ${memoryType}`);
  console.log(`   Content     : ${content.slice(0, 60)}...`);
  console.log(`   Memory Hash : ${memoryHash}`);

  const txHash = await walletClient.sendTransaction({
    to: account.address,
    value: 0n,
    data: toHex(`echomind:${memoryHash}`),
  });

  console.log(`   TX Hash     : ${txHash}`);
  console.log("   Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

  console.log("\n✅ Memory anchored on Pharos!");
  console.log(`   TX Hash     : ${receipt.transactionHash}`);
  console.log(`   Block       : ${receipt.blockNumber}`);
  console.log(`   Gas Used    : ${receipt.gasUsed.toString()}`);
  console.log(`   Explorer    : https://atlantic.pharosscan.xyz/tx/${receipt.transactionHash}`);

  return { txHash: receipt.transactionHash, blockNumber: receipt.blockNumber, memoryHash };
}

/**
 * verify() - Fetch tx from Pharos and check if calldata matches expected memory hash.
 */
async function verify(
  publicClient: Awaited<ReturnType<typeof getClients>>["publicClient"],
  txHash: `0x${string}`,
  expectedHash: string
) {
  console.log(`\n🔍 verify() — checking memory integrity on Pharos...`);
  console.log(`   TX Hash      : ${txHash}`);
  console.log(`   Expected Hash: ${expectedHash}`);

  const tx = await publicClient.getTransaction({ hash: txHash });
  const chainData = tx.input;
  const expectedCalldata = toHex(`echomind:${expectedHash}`);

  const valid = chainData === expectedCalldata;

  console.log(`\n${valid ? "✅" : "❌"} Verification ${valid ? "PASSED" : "FAILED"}`);
  console.log(`   On-chain data : ${chainData}`);
  console.log(`   Expected data : ${expectedCalldata}`);
  console.log(
    `   Result        : ${valid ? "VALID — memory is untampered" : "INVALID — mismatch detected"}`
  );

  return { valid, chainData, expectedCalldata };
}

// ============================================================
// Main Demo
// ============================================================

async function main() {
  console.log("🧠 EchoMind — Pharos Skill Demo");
  console.log("================================");
  console.log("Connecting to Pharos Atlantic Testnet...");

  const { publicClient, walletClient, account } = await getClients();
  console.log(`✅ Connected | Signer: ${account.address}`);

  // Step 1: Anchor a memory on-chain
  const result = await remember(
    publicClient,
    walletClient,
    account,
    "agent-001",
    "Decided to swap USDC to WETH because ETH price dropped 5% below 7-day MA",
    "decision"
  );

  // Step 2: Verify the memory
  await verify(publicClient, result.txHash as `0x${string}`, result.memoryHash);

  console.log("\n🎉 EchoMind Skill demo complete!");
  console.log(`   View on PharosScan: https://atlantic.pharosscan.xyz/tx/${result.txHash}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Unhandled error:", message);
  process.exit(1);
});