import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AUTH_SECRET: "ai-career-navigator-super-secret-key-1234567890",
    NEXTAUTH_URL: "https://airesumecareer.netlify.app",
  },
  serverExternalPackages: ["pdf-parse", "mammoth", "@prisma/client"],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
