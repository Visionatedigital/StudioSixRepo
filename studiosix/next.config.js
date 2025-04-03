/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: 'custom',
    loaderFile: './image-loader.js',
  },
  serverExternalPackages: ['@prisma/client', 'bcrypt'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      type: 'asset/resource'
    });
    config.externals = [...config.externals, 'bcrypt'];
    return config;
  },
  // Increase header size limit
  serverOptions: {
    maxHeaderSize: 32768, // 32KB
  },
}

module.exports = nextConfig 