import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the pages a signed-out visitor (or a search crawler) can actually
// browse and get value from -- /inbox, /profile, /host-dashboard are all
// auth-gated and either show a "sign in" prompt or someone's private data,
// neither of which belongs in a search index (see robots.ts, which disallows
// crawling those same paths outright).
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/community", "/diveshop", "/legal"];
  const now = new Date();

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.6,
  }));
}
