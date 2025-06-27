/** @type {import('next').NextConfig} */
const path = require('path');
const fs = require('fs');

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
      };
    }

    // Handle bcrypt and other externals properly for both client and server
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('bcrypt');
      config.externals.push('canvas');
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
    
    // React CJS resolution - comprehensive approach for both client and server
    const reactBasePath = path.join(process.cwd(), 'node_modules', 'react');
    const reactDomBasePath = path.join(process.cwd(), 'node_modules', 'react-dom');
    
    // Check if React CJS files exist
    const reactProdPath = path.join(reactBasePath, 'cjs', 'react.production.min.js');
    const reactJsxProdPath = path.join(reactBasePath, 'cjs', 'react-jsx-runtime.production.min.js');
    const reactDevPath = path.join(reactBasePath, 'cjs', 'react.development.js');
    const reactJsxDevPath = path.join(reactBasePath, 'cjs', 'react-jsx-runtime.development.js');
    
    console.log('React CJS files check:');
    console.log('Production:', fs.existsSync(reactProdPath));
    console.log('JSX Production:', fs.existsSync(reactJsxProdPath));
    console.log('Development:', fs.existsSync(reactDevPath));
    console.log('JSX Development:', fs.existsSync(reactJsxDevPath));
    console.log('React base path:', reactBasePath);
    console.log('Current working directory:', process.cwd());
    
    // Initialize resolve alias if it doesn't exist
    config.resolve.alias = config.resolve.alias || {};
    
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

    // Custom webpack plugin to handle React CJS resolution at runtime
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap('ReactCJSResolver', (factory) => {
          factory.hooks.beforeResolve.tap('ReactCJSResolver', (resolveData) => {
            if (resolveData.request && resolveData.request.includes('./cjs/react')) {
              console.log('Intercepting React CJS request:', resolveData.request);
              
              // Replace relative CJS paths with absolute paths
              if (resolveData.request === './cjs/react.production.min.js') {
                resolveData.request = reactProdPath;
              } else if (resolveData.request === './cjs/react-jsx-runtime.production.min.js') {
                resolveData.request = reactJsxProdPath;
              } else if (resolveData.request === './cjs/react.development.js') {
                resolveData.request = reactDevPath;
              } else if (resolveData.request === './cjs/react-jsx-runtime.development.js') {
                resolveData.request = reactJsxDevPath;
              }
              
              console.log('Resolved to:', resolveData.request);
            }
          });
        });
      }
    });

    // Handle private fields syntax
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/undici/,
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
    serverComponentsExternalPackages: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'cheerio', 'undici'],
  },
}

// Special handling for static export (build command)
if (process.env.NODE_ENV === 'production' && process.env.NEXT_STATIC_BUILD === 'true') {
  nextConfig.output = 'export';
  // Remove headers during static export
  nextConfig.headers = () => [];
}

module.exports = nextConfig 