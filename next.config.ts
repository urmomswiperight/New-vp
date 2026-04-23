import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    "playwright",
    "playwright-core",
    "playwright-extra",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "puppeteer-extra-plugin-user-preferences",
    "puppeteer-extra-plugin",
    "clone-deep",
    "merge-deep",
    "is-plain-object"
  ],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
