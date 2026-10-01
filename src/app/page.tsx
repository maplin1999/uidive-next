"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Deliberately minimal: this page's only job right now is to prove the
// pipeline works end to end (Next.js boots, Tailwind styles apply, the
// Supabase client initializes and can reach your project) before any real
// page gets migrated onto it. See the migration plan for what replaces
// this next (the Legal tab, first).
export default function Home() {
  const [status, setStatus] = useState<"checking" | "ok" | "error">(
    "checking"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // getSession() doesn't require anyone to be signed in or touch any
    // table's RLS policy -- it just confirms the URL/anon key pair is
    // valid and Supabase answered, which is all this smoke test needs.
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          setErrorMessage(error.message);
        } else {
          setStatus("ok");
        }
      })
      .catch((err: Error) => {
        setStatus("error");
        setErrorMessage(err.message);
      });
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-black">UiDive — Next.js scaffold</h1>
        <p className="text-slate-400 text-sm">
          If you can see this page, Next.js and Tailwind are both working.
        </p>
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          {status === "checking" && (
            <p className="text-slate-400 text-sm">Checking Supabase connection…</p>
          )}
          {status === "ok" && (
            <p className="text-emerald-400 text-sm font-bold">
              ✅ Supabase client connected
            </p>
          )}
          {status === "error" && (
            <div className="text-rose-400 text-sm">
              <p className="font-bold">❌ Supabase connection failed</p>
              <p className="mt-1 font-mono text-xs">{errorMessage}</p>
              <p className="mt-2 text-slate-400">
                Check that .env.local has the right
                NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
