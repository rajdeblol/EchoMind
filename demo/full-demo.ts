import { createEchoMind } from '../dist/index.js';
import { config } from 'dotenv';

// Load environment variables
config();

async function runDemo() {
  console.log('🚀 EchoMind Demo - Persistent Agent Memory Skill\n');
  
  try {
    // Initialize EchoMind
    console.log('📦 Initializing EchoMind...');
    const echoMind = createEchoMind();
    
    const agentId = 'demo-agent-001';
    console.log(`🤖 Agent ID: ${agentId}`);
    console.log(`📍 Pharos Address: ${echoMind.getPharosAddress()}`);
    
    // Check Pharos balance
    const balance = await echoMind.getPharosBalance();
    console.log(`💰 Pharos Balance: ${balance} PHRS\n`);
    
    // 1. REMEMBER - Store memories
    console.log('📝 Step 1: Storing Memories\n');
    
    const memoriesToStore = [
      {
        content: 'The user prefers dark mode UI with purple accent colors (#7c3aed)',
        type: 'text' as const,
      },
      {
        content: 'User authentication should use JWT tokens with 24-hour expiry',
        type: 'code' as const,
      },
      {
        content: 'Important meeting scheduled for Friday 3 PM about blockchain integration',
        type: 'event' as const,
      },
      {
        content: 'User asked about Pharos testnet RPC URL: https://atlantic.dplabs-internal.com',
        type: 'text' as const,
      },
      {
        content: 'Implementation plan for semantic search using all-MiniLM-L6-v2 embeddings',
        type: 'code' as const,
      },
    ];
    
    const storedMemories = [];
    
    for (const [index, memory] of memoriesToStore.entries()) {
      console.log(`📌 Storing memory ${index + 1}: ${memory.content.substring(0, 50)}...`);
      
      const result = await echoMind.remember({
        agentId,
        content: memory.content,
        type: memory.type,
      });
      
      storedMemories.push(result);
      
      console.log(`   Memory ID: ${result.memory.id}`);
      console.log(`   Hash: ${result.memory.hash}`);
      if (result.txHash) {
        console.log(`   Transaction: https://atlantic.pharosscan.xyz/tx/${result.txHash}`);
      }
      console.log('');
    }
    
    // 2. RECALL - Search memories
    console.log('🔍 Step 2: Recalling Memories\n');
    
    const queries = [
      'What are the user interface preferences?',
      'Tell me about authentication implementation',
      'Are there any scheduled meetings?',
      'Pharos blockchain information',
    ];
    
    for (const query of queries) {
      console.log(`📥 Query: "${query}"`);
      
      const results = await echoMind.recall({
        agentId,
        query,
        topK: 2,
      });
      
      for (const [i, result] of results.entries()) {
        console.log(`   ${i + 1}. Similarity: ${result.similarity.toFixed(4)}`);
        console.log(`      Content: ${result.memory.content.substring(0, 80)}...`);
        console.log(`      Type: ${result.memory.type}`);
        console.log(`      Timestamp: ${new Date(result.memory.timestamp).toLocaleString()}`);
      }
      console.log('');
    }
    
    // 3. VERIFY - Check blockchain proof
    console.log('🔐 Step 3: Verifying Memories on Blockchain\n');
    
    const memoryToVerify = storedMemories.find(m => m.txHash);
    
    if (memoryToVerify && memoryToVerify.txHash) {
      console.log(`Verifying memory: ${memoryToVerify.memory.id}`);
      console.log(`Transaction: ${memoryToVerify.txHash}`);
      
      const verification = await echoMind.verify({
        memoryId: memoryToVerify.memory.id,
        txHash: memoryToVerify.txHash,
      });
      
      console.log('\n📋 Verification Results:');
      console.log(`   ✅ Valid: ${verification.valid}`);
      console.log(`   🔗 Local Hash: ${verification.localHash}`);
      console.log(`   ⛓️  On-chain Hash: ${verification.onChainHash}`);
      console.log(`   📦 Block Number: ${verification.blockNumber || 'Pending'}`);
      console.log(`   🕒 Timestamp: ${verification.timestamp ? new Date(Number(verification.timestamp) * 1000).toLocaleString() : 'N/A'}`);
      
      if (verification.valid) {
        console.log('\n🎉 SUCCESS: Memory integrity verified on Pharos blockchain!');
        console.log(`🔗 Explorer: https://atlantic.pharosscan.xyz/tx/${memoryToVerify.txHash}`);
      } else {
        console.log('\n⚠️  WARNING: Memory verification failed!');
      }
    } else {
      console.log('No anchored memories found for verification.');
    }
    
    // 4. Get statistics
    console.log('\n📊 Step 4: Memory Statistics\n');
    
    const stats = await echoMind.getAgentStats(agentId);
    console.log(`Total Memories: ${stats.totalMemories}`);
    console.log(`Average Memory Length: ${Math.round(stats.averageMemoryLength)} characters`);
    console.log('Memory Types:');
    for (const [type, count] of Object.entries(stats.memoryTypes)) {
      console.log(`   ${type}: ${count}`);
    }
    
    // 5. List all agent memories
    console.log('\n📚 Step 5: All Agent Memories\n');
    
    const allMemories = await echoMind.getAgentMemories(agentId, 10);
    for (const [i, memory] of allMemories.entries()) {
      console.log(`${i + 1}. [${memory.type.toUpperCase()}] ${memory.content.substring(0, 60)}...`);
      console.log(`   ID: ${memory.id}`);
      console.log(`   Anchored: ${memory.txHash ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${new Date(memory.createdAt).toLocaleString()}`);
      if (memory.txHash) {
        console.log(`   Explorer: https://atlantic.pharosscan.xyz/tx/${memory.txHash}`);
      }
      console.log('');
    }
    
    console.log('\n✨ Demo Completed Successfully!');
    console.log('\n🔗 Next Steps:');
    console.log('1. View transactions on PharosScan: https://atlantic.pharosscan.xyz');
    console.log('2. Run the Next.js dashboard: npm run dev');
    console.log('3. Check the database: ./echomind.db');
    
    // Cleanup
    await echoMind.cleanup();
    
  } catch (error) {
    console.error('\n❌ Demo Failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the demo
runDemo().catch(console.error);