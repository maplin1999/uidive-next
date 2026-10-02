import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// /inbox, /profile, and /host-dashboard are all signed-in-only -- a crawler
// hitting them anonymously only ever sees a "sign in" prompt (never real
// content, since every real data fetch there is behind auth + RLS), so
// there's nothing worth indexing and no reason to spend crawl budget there.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/inbox", "/profile", "/host-dashboard"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
