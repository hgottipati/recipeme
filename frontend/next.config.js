/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5001/api',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    }
    return config
  },
  // Force all pages to be client-side rendered
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable static optimization
  generateStaticParams: false,
}

module.exports = nextConfig
