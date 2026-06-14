import { kv } from '@vercel/kv'

// Test KV connection
async function testKV() {
  console.log('Testing Vercel KV connection...')
  
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error('❌ Environment variables not set:')
    console.error('   KV_REST_API_URL:', process.env.KV_REST_API_URL ? '✓' : '✗')
    console.error('   KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? '✓' : '✗')
    process.exit(1)
  }

  try {
    // Test basic operations
    await kv.set('test:echomind', 'Hello EchoMind!')
    const value = await kv.get<string>('test:echomind')
    console.log('✅ Basic operation test:', value)

    // Test list operations (used by EchoMind)
    await kv.lpush('test:list', 'item1', 'item2', 'item3')
    const listItems = await kv.lrange<string>('test:list', 0, 2)
    console.log('✅ List operation test:', listItems)

    // Clean up
    await kv.del('test:echomind', 'test:list')
    console.log('✅ Cleanup complete')

  } catch (error) {
    console.error('❌ KV connection failed:', error)
    process.exit(1)
  }
}

testRedis().catch(console.error)