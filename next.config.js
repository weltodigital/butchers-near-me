/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['koqqkpitepqwlfjymcje.supabase.co'],
  },
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
