import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* search results, personal pages and tools aren't content — keep crawlers on the index itself, in either language */
const PRIVATE = ["/search", "/saved", "/upload", "/u/", "/sign-in", "/dev-measure"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", ...PRIVATE, ...PRIVATE.map((p) => `/ar${p}`)] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
