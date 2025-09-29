/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable x-powered-by header for security
  poweredByHeader: false,
  images: {
    // Disable optimization to avoid cache header issues
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'http',
        hostname: '10.2.200.102',
        port: '9000',
        pathname: '/inventiq-assets/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
  // Configure headers for CORS only (caching handled by middleware)
  async headers() {
    return [
      // CORS headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ]
  },
  // Disable strict mode for better hot reload
  reactStrictMode: false,
  // Optimize for development
  swcMinify: true,
  // Required for Docker deployment
  output: 'standalone',
  // Generate build ID for cache busting
  generateBuildId: async () => {
    // Use timestamp for development, git commit hash for production
    if (process.env.NODE_ENV === 'production') {
      // Try to get git commit hash
      try {
        const { execSync } = require('child_process')
        return execSync('git rev-parse HEAD').toString().trim()
      } catch (error) {
        // Fallback to timestamp if git is not available
        return Date.now().toString()
      }
    }
    return 'development'
  },
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig