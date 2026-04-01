import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    "playwright-extra",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "is-plain-object"
  ],
};

export default nextConfig;
