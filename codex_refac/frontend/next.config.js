/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use export mode for Netlify
  output: process.env.NETLIFY === 'true' ? 'export' : undefined,
  trailingSlash: false,
  images: {
    unoptimized: true,
  }
}

module.exports = nextConfig