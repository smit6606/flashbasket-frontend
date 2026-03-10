import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  compress: true,
  /* config options here */
};

export default nextConfig;
