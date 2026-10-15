import type { NextConfig } from "next";

/* capture screenshots live in a bucket once deployed — see lib/captureSrc.ts */
const captures = process.env.NEXT_PUBLIC_CAPTURES_URL?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  /* the local embedded Postgres ships WebAssembly and data files that must load from node_modules as-is */
  serverExternalPackages: ["@electric-sql/pglite"],
  images: captures ? { remotePatterns: [new URL(`${captures}/captures/**`)] } : undefined,
};

export default nextConfig;
