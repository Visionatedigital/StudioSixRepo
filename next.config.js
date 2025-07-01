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
      'htmlparser2',
      'entities',
      'html-to-text',
      'resend',
      'cheerio',
      'undici'
    ]
  },
  images: {
    domains: ['cpzkvqdunuxsfxrcdzjq.supabase.co'],
  },
}

module.exports = nextConfig 