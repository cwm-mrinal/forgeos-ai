/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for S3 + CloudFront static hosting
  output: 'export',

  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  // Trailing slash for S3 compatibility
  trailingSlash: true,
}

module.exports = nextConfig
