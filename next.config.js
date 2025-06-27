/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

// Function to ensure React CJS files are accessible
function ensureReactCJSFiles() {
  try {
    const reactDir = path.join(process.cwd(), 'node_modules', 'react');
    const reactCjsDir = path.join(reactDir, 'cjs');
    
    // Check if CJS directory exists
    if (!fs.existsSync(reactCjsDir)) {
      console.log('React CJS directory not found, creating...');
      fs.mkdirSync(reactCjsDir, { recursive: true });
    }
    
    // Define the CJS files that should exist
    const cjsFiles = [
      'react.production.min.js',
      'react.development.js',
      'react-jsx-runtime.production.min.js',
      'react-jsx-runtime.development.js'
    ];
    
    // Check each file and create if missing
    cjsFiles.forEach(filename => {
      const filePath = path.join(reactCjsDir, filename);
      if (!fs.existsSync(filePath)) {
        console.log(`Creating missing React CJS file: ${filename}`);
        
        // Create a basic React CJS export that re-exports from the main React module
        let content = '';
        if (filename.includes('jsx-runtime')) {
          content = `
// Auto-generated React JSX Runtime CJS wrapper
'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('react/jsx-runtime');
} else {
  module.exports = require('react/jsx-runtime');
}
`;
        } else {
          content = `
// Auto-generated React CJS wrapper
'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('react');
} else {
  module.exports = require('react');
}
`;
        }
        
        try {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Successfully created: ${filePath}`);
        } catch (writeError) {
          console.warn(`Failed to create ${filePath}:`, writeError.message);
        }
      } else {
        console.log(`React CJS file exists: ${filename}`);
      }
    });
    
  } catch (error) {
    console.warn('Error ensuring React CJS files:', error.message);
  }
}

// Ensure React CJS files exist before Next.js starts
ensureReactCJSFiles();

const nextConfig = {
  distDir: '.next',
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com', 'res.cloudinary.com'],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { isServer, dev }) => {
    // Handle client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
        child_process: false,
        'puppeteer-core': false,
        'puppeteer-extra': false,
        'puppeteer-extra-plugin-stealth': false,
      };
    }

    // Handle bcrypt and other externals properly for both client and server
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('bcrypt');
      config.externals.push('canvas');
      config.externals.push('puppeteer-core');
      config.externals.push('puppeteer-extra');
      config.externals.push('puppeteer-extra-plugin-stealth');
      config.externals.push('htmlparser2');
      config.externals.push('entities');
      config.externals.push('html-to-text');
      config.externals.push('resend');
    }

    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: 'asset/resource'
    });

    // Properly handle canvas-related modules
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'konva/lib/index-node': 'konva/lib/index',
      };
    }

    // External libraries configuration
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
    });

    if (isServer) {
      config.externals.push('cheerio', 'undici');
    }
    
    // Enhanced React CJS resolution with multiple strategies
    const reactBasePath = path.join(process.cwd(), 'node_modules', 'react');
    const reactCjsPath = path.join(reactBasePath, 'cjs');
    
    // Verify React CJS files exist
    console.log('Webpack config - React base path:', reactBasePath);
    console.log('Webpack config - React CJS path exists:', fs.existsSync(reactCjsPath));
    
    if (fs.existsSync(reactCjsPath)) {
      const cjsFiles = ['react.production.min.js', 'react-jsx-runtime.production.min.js', 'react.development.js', 'react-jsx-runtime.development.js'];
      cjsFiles.forEach(file => {
        const filePath = path.join(reactCjsPath, file);
        console.log(`Webpack config - ${file} exists:`, fs.existsSync(filePath));
      });
    }
    
    // Initialize resolve alias if it doesn't exist
    config.resolve.alias = config.resolve.alias || {};
    
    // Direct path mappings for React CJS files
    const reactProdPath = path.join(reactCjsPath, 'react.production.min.js');
    const reactJsxProdPath = path.join(reactCjsPath, 'react-jsx-runtime.production.min.js');
    const reactDevPath = path.join(reactCjsPath, 'react.development.js');
    const reactJsxDevPath = path.join(reactCjsPath, 'react-jsx-runtime.development.js');
    
    // Map the problematic imports to actual filesystem paths
    config.resolve.alias['./cjs/react.production.min.js'] = reactProdPath;
    config.resolve.alias['./cjs/react-jsx-runtime.production.min.js'] = reactJsxProdPath;
    config.resolve.alias['./cjs/react.development.js'] = reactDevPath;
    config.resolve.alias['./cjs/react-jsx-runtime.development.js'] = reactJsxDevPath;
    
    // Also handle absolute imports
    config.resolve.alias['react/cjs/react.production.min.js'] = reactProdPath;
    config.resolve.alias['react/cjs/react-jsx-runtime.production.min.js'] = reactJsxProdPath;
    config.resolve.alias['react/cjs/react.development.js'] = reactDevPath;
    config.resolve.alias['react/cjs/react-jsx-runtime.development.js'] = reactJsxDevPath;

    // Enhanced resolve configuration for better module resolution
    config.resolve.modules = config.resolve.modules || [];
    config.resolve.modules.unshift(path.join(process.cwd(), 'node_modules'));
    
    // Add resolve.roots for better module resolution
    config.resolve.roots = config.resolve.roots || [];
    config.resolve.roots.push(process.cwd());

    // Handle private fields syntax and other problematic modules
    config.module.rules.push({
      test: /\.js$/,
      include: [
        /node_modules\/undici/,
        /node_modules\/puppeteer-core/,
        /node_modules\/clone-deep/,
        /node_modules\/puppeteer-extra/
      ],
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['@babel/plugin-transform-private-property-in-object', { loose: true }],
            ['@babel/plugin-transform-class-properties', { loose: true }],
            ['@babel/plugin-transform-private-methods', { loose: true }]
          ]
        }
      }
    });

    // Ignore problematic dynamic requires in clone-deep
    config.module.rules.push({
      test: /node_modules\/clone-deep\/utils\.js$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            ['babel-plugin-transform-require-ignore', {
              extensions: ['.js']
            }]
          ]
        }
      }
    });

    return config;
  },
  // Only use headers in development and production, not during static export
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Skip API routes and dynamic routes during static export
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'canvas', 'puppeteer-core', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'htmlparser2', 'entities', 'html-to-text', 'resend']
  }
}

// Special handling for static export (build command)
if (process.env.NODE_ENV === 'production' && process.env.NEXT_STATIC_BUILD === 'true') {
  nextConfig.output = 'export';
  // Remove headers during static export
  nextConfig.headers = () => [];
}

module.exports = nextConfig 