import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google/adk', '@google/genai'],
};

export default nextConfig;
