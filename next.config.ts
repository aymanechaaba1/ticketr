import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: 'tidy-kiwi-28.convex.cloud', protocol: 'https' },
      { hostname: 'oceanic-gerbil-67.convex.cloud', protocol: 'https' },
    ],
  },
};

export default nextConfig;
