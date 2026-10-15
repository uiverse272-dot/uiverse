import type { NextConfig } from "next";

/* capture screenshots live in a bucket once deployed — see lib/captureSrc.ts */
const captures = process.env.NEXT_PUBLIC_CAPTURES_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: captures ? { remotePatterns: [new URL(`${captures}/captures/**`)] } : undefined,
};

export default nextConfig;
