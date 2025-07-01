/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
      };
    }

    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('canvas');
      config.externals.push('cheerio');
      config.externals.push('undici');
      config.externals.push('@sparticuz/chromium');
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: [
      'bcryptjs',
      'canvas', 
      'puppeteer-core',
      '@sparticuz/chromium',
      'htmlparser2'
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

module.exports = nextConfig; 