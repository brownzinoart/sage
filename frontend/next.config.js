/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use export mode for Netlify deployment, but allow API routes in development
  output: process.env.NETLIFY ? 'export' : undefined,
  trailingSlash: false,
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig