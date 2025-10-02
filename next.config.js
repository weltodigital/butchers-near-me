/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['koqqkpitepqwlfjymcje.supabase.co'],
  },
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during builds
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
