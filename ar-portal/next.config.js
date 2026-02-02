/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Fix for Windows: ignore system files that cause EINVAL errors during watch
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/.next/**',
        // Windows system files
        '**/DumpStack.log.tmp',
        '**/hiberfil.sys',
        '**/pagefile.sys',
        '**/swapfile.sys',
        // Common patterns for system files
        /[\\/]System Volume Information[\\/]/,
        /[\\/]\$Recycle\.Bin[\\/]/,
      ],
    };
    return config;
  },
};

module.exports = nextConfig;
