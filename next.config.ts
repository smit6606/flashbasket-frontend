import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['localhost', 'res.cloudinary.com', '0bldvnch-5000.inc1.devtunnels.ms', '0bldvnch-3000.inc1.devtunnels.ms'],
  },
  compress: true,
  /* config options here */
};

export default nextConfig;
