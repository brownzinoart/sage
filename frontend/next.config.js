/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove export mode during development to allow API routes
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  trailingSlash: false,
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig