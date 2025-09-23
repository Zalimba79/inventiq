/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable x-powered-by header for security
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  // Allow hot reload from any origin during development
  async headers() {
    return [
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
}

module.exports = nextConfig