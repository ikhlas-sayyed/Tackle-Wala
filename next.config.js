/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    PAYTM_MID: process.env.PAYTM_MID,
    PAYTM_KEY: process.env.PAYTM_KEY,
    PAYTM_WEBSITE: process.env.PAYTM_WEBSITE,
    PAYTM_INDUSTRY_TYPE: process.env.PAYTM_INDUSTRY_TYPE,
    PAYTM_CHANNEL_ID: process.env.PAYTM_CHANNEL_ID,
    PAYTM_CALLBACK_URL: process.env.PAYTM_CALLBACK_URL,
  },
}

module.exports = nextConfig
