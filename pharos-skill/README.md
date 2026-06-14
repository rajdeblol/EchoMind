# EchoMind — Pharos Skill

On-chain memory anchoring skill for Pharos AI Agents.

## Setup

```bash
cd pharos-skill
npm install
export PRIVATE_KEY=your_private_key_here
npm run demo
```

## Methods

### remember(agentId, content, type)

Anchors a keccak256 memory hash on Pharos as tx calldata.

Returns: txHash, blockNumber, memoryHash

### verify(txHash, expectedHash)

Fetches tx from Pharos, compares calldata against expected hash.

Returns: { valid: boolean }

## Network

- Testnet RPC: https://atlantic.dplabs-internal.com (Chain ID: 688689)
- Explorer: https://atlantic.pharosscan.xyz