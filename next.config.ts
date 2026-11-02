import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.GITHUB_PAGES === "true" ? {
    output: "export" as const,
    basePath: "/Invitation_Quant",
    trailingSlash: true,
    images: { unoptimized: true },
  } : {}),
  /* config options here */
  cacheComponents: process.env.GITHUB_PAGES !== "true",
  partialPrefetching: process.env.GITHUB_PAGES !== "true",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
