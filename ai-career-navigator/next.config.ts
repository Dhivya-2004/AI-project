import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth", "@prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    AUTH_SECRET: "ai-career-navigator-super-secret-key-2024",
    AUTH_TRUST_HOST: "true",
  },
};

export default nextConfig;
