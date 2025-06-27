#!/usr/bin/env node

console.log('🔍 Environment Variable Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('VERCEL_ENV:', process.env.VERCEL_ENV);

const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  console.log('✅ DATABASE_URL exists');
  console.log('📍 DATABASE_URL (masked):', dbUrl.replace(/:[^:@]*@/, ':***@'));
  
  // Parse the URL to show components
  try {
    const url = new URL(dbUrl.replace('postgresql://', 'http://'));
    console.log('🔗 Hostname:', url.hostname);
    console.log('🔗 Port:', url.port);
    console.log('🔗 Database:', url.pathname.slice(1));
    
    if (url.hostname.includes('pooler.supabase.com')) {
      console.log('✅ Using Session pooler (correct for Vercel)');
    } else if (url.hostname.includes('.supabase.co')) {
      console.log('❌ Using direct connection (IPv6 - will fail on Vercel)');
    }
    
    if (url.port === '6543') {
      console.log('✅ Using pooler port 6543 (correct)');
    } else if (url.port === '5432') {
      console.log('❌ Using direct port 5432 (will fail on Vercel)');
    }
    
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error.message);
  }
} else {
  console.error('❌ DATABASE_URL not found!');
}

console.log('\n🔍 All environment variables containing "DATABASE":');
Object.keys(process.env)
  .filter(key => key.includes('DATABASE') || key.includes('POSTGRES'))
  .forEach(key => {
    const value = process.env[key];
    console.log(`${key}:`, value ? value.replace(/:[^:@]*@/, ':***@') : 'undefined');
  }); 