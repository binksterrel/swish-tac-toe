/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'a.espncdn.com' }, // team logos
      { protocol: 'https', hostname: 'ak-static.cms.nba.com' }, // NBA headshots
      { protocol: 'https', hostname: 'nba-players.herokuapp.com' }, // fallback headshots
      { protocol: 'https', hostname: 'api.dicebear.com' }, // avatars signup
      { protocol: 'https', hostname: 'flagcdn.com' }, // flags in criteria
    ],
  },
}

export default nextConfig
