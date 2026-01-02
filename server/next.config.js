/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
    DATABASE_URL: process.env.DATABASE_URL,
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    domains: [],
    remotePatterns: [],
  },
  // ✅ REMOVED: CORS headers are now handled in api-handler.ts
  // This prevents duplicate Access-Control-Allow-Origin headers
};

module.exports = nextConfig;