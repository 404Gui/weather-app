import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    warning: false,
    error: false,
    buildActivity: false,
  },
};

export default nextConfig;
