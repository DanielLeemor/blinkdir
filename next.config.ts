import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.screenshotone.com',
        pathname: '/take',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons',
      },
      // Allow all domains for icons/screenshots flexibility since we aggregate content
      // In strict production, this might be restricted, but for a directory of user content:
      {
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
