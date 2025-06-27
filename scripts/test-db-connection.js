#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'NOT SET');
  
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Successfully queried database. User count: ${userCount}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.message.includes('db.cpzkvqdunuxsfxrcdzjq.supabase.co:5432')) {
      console.error('🚨 ISSUE: Still using old direct connection instead of pooler!');
      console.error('🔧 Make sure DATABASE_URL uses the Session pooler with port 6543');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 