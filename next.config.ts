
// next.config.ts

import type { NextConfig } from "next";
import withNextBundleAnalyzer from "next-bundle-analyzer";

const nextConfig: NextConfig = {
    // Next.js config options
};

export default withNextBundleAnalyzer({
    enabled: !!process.env.VERCEL,
    format: "json",
})(nextConfig);
