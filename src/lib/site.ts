// Single source of truth for the deployed site's public URL -- used by
// sitemap.ts, robots.ts, and the root layout's metadataBase so canonical/
// Open Graph URLs are correct wherever this gets deployed (Vercel preview
// URLs, a future custom domain, etc.) without hardcoding a domain in several
// places. Set NEXT_PUBLIC_SITE_URL in your Vercel project's env vars once
// you have a real domain; VERCEL_URL is set automatically by Vercel on every
// deploy (preview and production) as a fallback so this still works before
// you do.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000"
).replace(/\/$/, "");
