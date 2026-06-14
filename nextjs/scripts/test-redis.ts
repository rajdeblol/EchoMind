import { Redis } from '@upstash/redis'

// Test Redis connection
async function testRedis() {
  console.log('Testing Upstash Redis connection...')
  
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Environment variables not set:')
    console.error('   UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? '✓' : '✗')
    console.error('   UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? '✓' : '✗')
    process.exit(1)
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })

    // Test basic operations
    await redis.set('test:echomind', 'Hello EchoMind!')
    const value = await redis.get<string>('test:echomind')
    console.log('✅ Basic operation test:', value)

    // Test list operations (used by EchoMind)
    await redis.lpush('test:list', 'item1', 'item2', 'item3')
    const listItems = await redis.lrange<string>('test:list', 0, 2)
    console.log('✅ List operation test:', listItems)

    // Clean up
    await redis.del('test:echomind', 'test:list')
    console.log('✅ Cleanup complete')

  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    process.exit(1)
  }
}

testRedis().catch(console.error)