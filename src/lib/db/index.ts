import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Current working directory:', process.cwd());
console.log('Loading .env file...');
console.log('Environment variables loaded:', {
  DATABASE_URL: process.env.DATABASE_URL ? '***exists***' : undefined,
  NODE_ENV: process.env.NODE_ENV,
  PWD: process.env.PWD
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema }); 