/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-checkbox',
      'react-syntax-highlighter'
    ]
  }
}

// Webpack optimization for bundle splitting
nextConfig.webpack = (config, { isServer }) => {
  if (!isServer) {
    config.optimization.splitChunks = {
      ...config.optimization.splitChunks,
      cacheGroups: {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          maxSize: 244000,
        },
        radix: {
          test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
          name: 'radix',
          chunks: 'all',
          priority: 10,
        },
        ai: {
          test: /[\\/]node_modules[\\/](@openrouter|ai)[\\/]/,
          name: 'ai-libs',
          chunks: 'all',
          priority: 10,
        }
      }
    }
  }
  return config
}

module.exports = nextConfig
