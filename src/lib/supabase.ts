import { createClient } from "@supabase/supabase-js";

// Same pattern as the old app.js: only the public anon key lives here, read
// from env vars instead of hardcoded. Enforcement of what a signed-in (or
// anonymous) visitor can actually read/write happens in Supabase's Row
// Level Security policies on the database side, not in this file -- see the
// security conversation that preceded this rewrite.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  // Thrown at build/dev-start time rather than failing silently later --
  // a missing .env.local is the single most common "why is nothing
  // loading" bug when picking this project up fresh.
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Copy .env.local.example to .env.local and fill them in."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
