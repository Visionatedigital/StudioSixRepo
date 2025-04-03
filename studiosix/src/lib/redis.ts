import Redis from 'ioredis';

// Create Redis client
const redis = new Redis({
  host: 'localhost', // Default Redis host
  port: 6379, // Default Redis port
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

// Key prefix for transaction references
const TRANSACTION_REF_PREFIX = 'tx_ref:';

// TTL for transaction references (30 days in seconds)
const TRANSACTION_REF_TTL = 30 * 24 * 60 * 60;

export async function isTransactionReferenceUsed(reference: string): Promise<boolean> {
  try {
    const key = TRANSACTION_REF_PREFIX + reference;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error('Redis error checking transaction reference:', error);
    return false; // In case of Redis error, allow the transaction to proceed
  }
}

export async function markTransactionReferenceAsUsed(reference: string): Promise<void> {
  try {
    const key = TRANSACTION_REF_PREFIX + reference;
    await redis.set(key, '1', 'EX', TRANSACTION_REF_TTL);
  } catch (error) {
    console.error('Redis error marking transaction reference:', error);
  }
}

export default redis; 