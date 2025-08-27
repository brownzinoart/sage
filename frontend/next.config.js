/** @type {import('next').NextConfig} */
const nextConfig = {
  // Temporarily disable output export for development
  // output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  }
}

module.exports = nextConfig