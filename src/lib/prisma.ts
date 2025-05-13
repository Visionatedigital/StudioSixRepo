import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Debug environment variables
console.log('[PRISMA] Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
  DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length,
  DATABASE_URL_PROTOCOL: process.env.DATABASE_URL?.split('://')[0],
  DATABASE_URL_HOST: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0],
  DATABASE_URL_DB: process.env.DATABASE_URL?.split('/').pop()?.split('?')[0],
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Add debug logging
console.log('[PRISMA] Initializing Prisma client with database URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password in logs

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'error', 'info', 'warn'],
});

// Simplified logging - remove event listeners that are causing type issues
console.log('[PRISMA] Client initialized with logging enabled');

// Add connection test with detailed error handling
prisma.$connect()
  .then(() => {
    console.log('[PRISMA] Successfully connected to database');
    // Test a simple query
    return prisma.$queryRaw`SELECT 1`;
  })
  .then(() => {
    console.log('[PRISMA] Test query successful');
  })
  .catch((error) => {
    console.error('[PRISMA] Failed to connect to database:', error);
    // Log additional error details
    if (error instanceof Error) {
      console.error('[PRISMA] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      });
    }
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} 