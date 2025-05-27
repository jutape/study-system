import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/study/images/:path*',
        destination: '/api/study-images/:path*',
      },
    ];
  },
};

export default nextConfig;
