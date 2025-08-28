/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use export mode only for Netlify, allow normal build for Railway
  output: process.env.NETLIFY === 'true' ? 'export' : undefined,
  trailingSlash: false,
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig