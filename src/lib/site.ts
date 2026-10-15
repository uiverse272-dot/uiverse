/**
 * The canonical origin, for metadata, the sitemap and share images. NEXT_PUBLIC_SITE_URL wins;
 * on Vercel the production domain is known without it; locally it's the dev server.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");
