import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {    
    buildActivity: false,
    appIsrStatus: false,

  },
  
  images: {
    domains: ['openweathermap.org']
  }
};

export default nextConfig;
