/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@prisma/client',
      'prisma',
      'playwright-core',
      'puppeteer-core',
      'puppeteer-extra',
      'puppeteer-extra-plugin-stealth',
      'canvas'
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize server-only packages
      config.externals = [...(config.externals || []), 
        'puppeteer-core',
        'puppeteer-extra',
        'puppeteer-extra-plugin-stealth',
        'playwright-core',
        'canvas'
      ];
    }
    
    // Add fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
        child_process: false,
        net: false,
        tls: false,
        'puppeteer-extra': false,
        'puppeteer-extra-plugin-stealth': false,
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