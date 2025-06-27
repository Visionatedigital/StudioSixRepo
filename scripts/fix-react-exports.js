#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React CJS exports for Vercel deployment...');

try {
  const reactPackageJsonPath = path.join(process.cwd(), 'node_modules', 'react', 'package.json');
  
  if (!fs.existsSync(reactPackageJsonPath)) {
    console.error('❌ React package.json not found');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(reactPackageJsonPath, 'utf8'));
  
  // Check if exports already include CJS paths
  const exports = packageJson.exports || {};
  const hasCjsExports = exports['./cjs/react.production.min.js'];
  
  if (hasCjsExports) {
    console.log('✅ React CJS exports already exist');
    return;
  }
  
  // Add the missing CJS exports
  packageJson.exports = {
    ...exports,
    './cjs/react.production.min.js': './cjs/react.production.min.js',
    './cjs/react.development.js': './cjs/react.development.js',
    './cjs/react-jsx-runtime.production.min.js': './cjs/react-jsx-runtime.production.min.js',
    './cjs/react-jsx-runtime.development.js': './cjs/react-jsx-runtime.development.js'
  };
  
  // Write the updated package.json
  fs.writeFileSync(reactPackageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Successfully added React CJS exports');
  console.log('📦 Updated exports:', Object.keys(packageJson.exports).filter(key => key.includes('cjs')));
  
} catch (error) {
  console.error('❌ Error fixing React exports:', error.message);
  process.exit(1);
} 