import type { NextConfig } from "next";

// Momo is a local-first PWA: every screen is a client component reading on-device
// state, so we ship a fully static export that any static host (or the SW cache) can serve.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
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
