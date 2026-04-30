import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Wildcard: allows ALL ngrok URLs so you don't need to update this every restart
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok.io',
  ],
};

export default nextConfig;
