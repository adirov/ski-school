export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/env";

/**
 * Pages we do not want indexed (thank-you, search, preview builds) use <meta name="robots" content="noindex">,
 * so they are NOT blocked here: crawlers must be able to read that tag.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: !INDEXABLE ? undefined : `${SITE_URL}/sitemap.xml`,
  };
}
