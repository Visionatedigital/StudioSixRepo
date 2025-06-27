/** @type {import('next').NextConfig} */
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

    // Handle bcrypt and other externals properly for both client and server
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('bcrypt');
      config.externals.push('canvas');
      config.externals.push('puppeteer-core');
      config.externals.push('puppeteer-extra');
      config.externals.push('puppeteer-extra-plugin-stealth');
      config.externals.push('cheerio');
      config.externals.push('undici');
    }

    // Handle private fields syntax in undici and other problematic modules
    config.module.rules.push({
      test: /\.js$/,
      include: [
        /node_modules\/undici/,
        /node_modules\/cheerio/
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

    return config;
  },
  // Ensure Node.js compatibility and external packages
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'canvas', 'puppeteer-core', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth', 'cheerio', 'undici']
  }
}

module.exports = nextConfig 