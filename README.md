# EchoMind - Persistent Agent Memory Skill for Pharos Blockchain

EchoMind enables AI agents to store, recall, and verify memories with cryptographic proof anchored on the Pharos blockchain. Each memory hash is stored as calldata on-chain, creating immutable proof of existence.

## 🎯 Features

### Core Library
- **Remember**: Store agent memories locally and anchor hashes on Pharos
- **Recall**: Semantic search using embeddings (all-MiniLM-L6-v2 locally, OpenAI for Next.js)
- **Verify**: Cryptographic verification of memory integrity against on-chain data

### Tech Stack
- **Blockchain**: Pharos Testnet/Mainnet via viem
- **Embeddings**: Local (@xenova/transformers) or OpenAI (text-embedding-3-small)
- **Storage**: SQLite (local) or Vercel KV (Next.js)
- **Frontend**: Next.js 14 with Tailwind CSS
- **Language**: TypeScript strict mode

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Pharos wallet with testnet PHRS tokens
- OpenAI API key (for Next.js app)

### 1. Core Library Setup

```bash
# Clone and install
cd echomind
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Pharos private key and config

# Build library
npm run build

# Run demo
npm run demo
```

### 2. Next.js Dashboard Setup

```bash
cd nextjs
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your OpenAI API key and Vercel KV config

# Run development server
npm run dev
```

## 📖 API Reference

### Core Library

```typescript
import { createEchoMind } from 'echomind'

// Initialize
const echoMind = createEchoMind()

// Store memory
const { memory, txHash } = await echoMind.remember({
  agentId: 'agent-001',
  content: 'User prefers dark mode',
  type: 'text'
})

// Recall memories
const results = await echoMind.recall({
  agentId: 'agent-001',
  query: 'UI preferences',
  topK: 5
})

// Verify memory
const verification = await echoMind.verify({
  memoryId: memory.id,
  txHash: txHash!
})
```

### Next.js API Routes

- `POST /api/remember` - Store memory
- `POST /api/recall` - Search memories
- `POST /api/verify` - Verify on-chain proof

## 🎨 Dashboard Features

- **Dark UI**: Custom design with #0a0a0a background and #7c3aed accent
- **Real-time Stats**: Memory counts, verification rates, agent activity
- **Three Operations**: Remember, Recall, Verify forms
- **Recent Memories**: Live feed of stored memories
- **Blockchain Links**: Direct links to PharosScan explorer

## 🔧 Configuration

### Pharos Networks

```env
# Testnet (Default)
PHAROS_RPC_URL=https://atlantic.dplabs-internal.com
PHAROS_CHAIN_ID=688689

# Mainnet
PHAROS_RPC_URL=https://rpc.pharos.xyz
PHAROS_CHAIN_ID=1672
```

### Storage Options

1. **Local Mode** (Core Library):
   - SQLite database with better-sqlite3
   - Local embeddings with all-MiniLM-L6-v2

2. **Cloud Mode** (Next.js):
   - Vercel KV for fast memory storage
   - OpenAI embeddings for semantic search

## 📊 Demo Script

The project includes a complete demo script showing the full workflow:

```bash
cd echomind
npm run demo
```

This demonstrates:
1. Storing 5 sample memories
2. Performing semantic search with 4 queries
3. Verifying a memory on-chain
4. Displaying statistics and all memories

## 🛠️ Development

### Project Structure

```
echomind/
├── src/                    # Core library
│   ├── lib/               # Services (pharos, database, embeddings)
│   ├── types/             # TypeScript definitions
│   └── index.ts           # Main EchoMind class
├── demo/                  # Demo script
├── nextjs/                # Next.js dashboard
│   ├── app/               # Next.js 14 app router
│   ├── components/        # React components
│   ├── lib/               # Next.js services
│   └── types/             # Shared types
└── package.json          # Dependencies and scripts
```

### Available Scripts

```bash
# Core library
npm run build      # Build TypeScript
npm run dev        # Development watch mode
npm run demo       # Run demo script
npm run lint       # Lint code

# Next.js app
cd nextjs
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
```

## 🔒 Security

- Private keys stored in environment variables
- Memory content stored locally or in secure KV storage
- Blockchain anchoring provides cryptographic proof
- All sensitive operations require explicit confirmation

## 🌐 Blockchain Integration

### Memory Anchoring
1. Content hash is computed locally using SHA-256
2. Hash is sent as transaction calldata on Pharos
3. Transaction provides timestamp and block proof

### Verification Process
1. Retrieve memory from local storage
2. Fetch transaction from Pharos blockchain
3. Compare local hash with on-chain calldata
4. Validate block inclusion and timestamp

## 📈 Performance

- **Embeddings**: ~50ms per memory (local), ~200ms (OpenAI)
- **Storage**: O(1) memory storage, O(n log n) search
- **Blockchain**: ~2-5 seconds for testnet transactions
- **Search**: Semantic similarity with cosine distance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Pharos Blockchain](https://pharos.xyz)
- [PharosScan Explorer](https://atlantic.pharosscan.xyz)
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

Built for the Pharos Blockchain Hackathon - EchoMind Team