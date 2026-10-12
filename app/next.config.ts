import type { NextConfig } from "next";

// Momo is a local-first PWA: every screen is a client component reading on-device state.
// Static hosts and the iOS shell get a fully static export. On Vercel we also build the small
// Web Push API (src/app/api/push/*/route.api.ts — only picked up through the "api.ts" page extension).
const onVercel = !!process.env.VERCEL;
const nextConfig: NextConfig = {
  output: onVercel ? undefined : "export",
  pageExtensions: onVercel ? ["api.ts", "tsx", "ts"] : ["tsx", "ts"],
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
