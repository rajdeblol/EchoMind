/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    PHAROS_RPC_URL: process.env.PHAROS_RPC_URL || "",
    PHAROS_CHAIN_ID: process.env.PHAROS_CHAIN_ID || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  },
}

module.exports = nextConfig