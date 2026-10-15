import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/* search results, personal pages and tools aren't content — keep crawlers on the index itself */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/search", "/saved", "/upload", "/u/", "/dev-measure"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
