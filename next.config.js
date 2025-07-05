/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma', 'playwright-core', 'puppeteer-core', 'canvas']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude problematic modules for serverless
      config.externals = config.externals || [];
      config.externals.push('playwright-core');
      config.externals.push('puppeteer-core');
      config.externals.push('canvas');
    }
    
    // Add fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }
    
    return config;
  },
  // Ensure environment variables are available at build time
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  // Disable telemetry
  telemetry: {
    disabled: true
  },
  images: {
    domains: ['images.unsplash.com', 'plus.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig; 