import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'localhost', 
      'res.cloudinary.com', 
      'images.unsplash.com',
      ...(process.env.NEXT_PUBLIC_API_URL ? [new URL(process.env.NEXT_PUBLIC_API_URL).hostname] : []),
      ...(process.env.NEXT_PUBLIC_FRONTEND_URL ? [new URL(process.env.NEXT_PUBLIC_FRONTEND_URL).hostname] : [])
    ],
  },
  compress: true,
  /* config options here */
};

export default nextConfig;
