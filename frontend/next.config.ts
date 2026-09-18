import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from various sources during development
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Placeholder image for products
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
