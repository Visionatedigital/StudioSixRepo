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

    // Handle bcrypt properly for both client and server
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

    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      'bufferutil': 'commonjs bufferutil',
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
    serverComponentsExternalPackages: ['puppeteer-extra', 'puppeteer-extra-plugin-stealth'],
  },
}

// Special handling for static export (build command)
if (process.env.NODE_ENV === 'production' && process.env.NEXT_STATIC_BUILD === 'true') {
  nextConfig.output = 'export';
  // Remove headers during static export
  nextConfig.headers = () => [];
}

module.exports = nextConfig 