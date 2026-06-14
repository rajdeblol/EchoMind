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

    // Test connection
    await redis.ping()
    console.log('✅ Redis connection successful!')

    // Test basic operations
    await redis.set('test:echomind', 'Hello EchoMind!')
    const value = await redis.get<string>('test:echomind')
    console.log('✅ Basic operation test:', value)

    // Test sorted set operations (used by EchoMind)
    await redis.zadd('test:sorted-set', { score: Date.now(), member: 'test-item' })
    const items = await redis.zrange<string>('test:sorted-set', 0, 10, { rev: true })
    console.log('✅ Sorted set test:', items)

    // Clean up
    await redis.del('test:echomind', 'test:sorted-set')
    console.log('✅ Cleanup complete')

  } catch (error) {
    console.error('❌ Redis connection failed:', error)
    process.exit(1)
  }
}

testRedis().catch(console.error)