import type { NextConfig } from "next";

const backend = process.env.BACKEND_PROXY_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Standalone is for Docker self-hosting only — Vercel uses its own output layout.
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" as const } : {}),
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backend.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
