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
      config.externals = [...(config.externals || []), 
        'puppeteer-core',
        'puppeteer-extra',
        'puppeteer-extra-plugin-stealth',
        'playwright-core',
        'canvas'
      ];
    }
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
  env: {
    NEXT_TELEMETRY_DISABLED: '1',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cpzkvqdunuxsfxrcdzjq.supabase.co',
        pathname: '/storage/v1/object/public/all-uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
