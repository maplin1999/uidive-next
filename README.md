# UiDive — Next.js rewrite (in progress)

This replaces the vanilla-JS site (`app.js` + `index.html` + `styles.css`)
with Next.js, migrated one page at a time. See the migration plan from
Claude for the full page order.

## First-time setup

```
npm install
cp .env.local.example .env.local
# then open .env.local and paste in your Supabase anon key
npm run dev
```

Open http://localhost:3000 — you should see a "Supabase client connected"
confirmation. That's the whole pipeline (Next.js → Tailwind → Supabase)
working before any real page gets migrated onto it.

## Deploying

Push to GitHub, then import the repo in Vercel. Add the same two env vars
from `.env.local` under the Vercel project's Settings → Environment
Variables before the first deploy.

## Status

- [x] Project scaffold (this file's siblings)
- [x] Legal tab (`/legal`)
- [x] Home (trip browse/search) (`/`)
- [x] Community feed (`/community`)
- [ ] Inbox / messaging
- [ ] Dive Shop (booking flow)
- [ ] Profile (cosmetics, treasure chest, bookings)
- [ ] Host Dashboard
