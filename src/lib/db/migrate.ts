import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
console.log('Current working directory:', process.cwd());
console.log('Loading .env file...');
dotenv.config();

// Debug: Print environment variables (without sensitive values)
console.log('Environment variables loaded:', {
  DATABASE_URL: process.env.DATABASE_URL ? '***exists***' : '***missing***',
  NODE_ENV: process.env.NODE_ENV,
  PWD: process.env.PWD
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const db = drizzle(sql);

async function main() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'migrations', '0000_initial.sql');
    console.log('Migration file path:', migrationPath);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    console.log('Migration SQL loaded successfully');

    // Execute the migration
    await sql.unsafe(migrationSQL);
    
    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main(); 