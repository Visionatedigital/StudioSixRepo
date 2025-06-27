#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React-DOM CJS exports for Vercel deployment...');

try {
  const reactDomPackageJsonPath = path.join(process.cwd(), 'node_modules', 'react-dom', 'package.json');
  
  if (!fs.existsSync(reactDomPackageJsonPath)) {
    console.error('❌ React-DOM package.json not found');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync(reactDomPackageJsonPath, 'utf8'));
  
  // Check if exports already include CJS paths
  const exports = packageJson.exports || {};
  const hasCjsExports = exports['./cjs/react-dom.production.min.js'];
  
  if (hasCjsExports) {
    console.log('✅ React-DOM CJS exports already exist');
    return;
  }
  
  // Add the missing CJS exports
  packageJson.exports = {
    ...exports,
    './cjs/react-dom.production.min.js': './cjs/react-dom.production.min.js',
    './cjs/react-dom.development.js': './cjs/react-dom.development.js',
    './cjs/react-dom-server.browser.production.min.js': './cjs/react-dom-server.browser.production.min.js',
    './cjs/react-dom-server.browser.development.js': './cjs/react-dom-server.browser.development.js'
  };
  
  // Write the updated package.json
  fs.writeFileSync(reactDomPackageJsonPath, JSON.stringify(packageJson, null, 2));
  
  console.log('✅ Successfully added React-DOM CJS exports');
  console.log('📦 Updated exports:', Object.keys(packageJson.exports).filter(key => key.includes('cjs')));
  
} catch (error) {
  console.error('❌ Error fixing React-DOM exports:', error.message);
  process.exit(1);
} 