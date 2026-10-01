"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "uidive_cookie_consent";

// Migrated from the old site's #cookie-consent-banner
// (initCookieConsent()/setCookieConsent()): shown once per browser until the
// visitor picks Accept or Decline. The old site also tried a plain cookie
// before falling back to localStorage -- here localStorage alone is enough
// since there's no server-side code that needs to read the choice.
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY);
      if (!consent) setVisible(true);
    } catch {
      // storage unavailable -- just don't show the banner rather than erroring.
    }
  }, []);

  function choose(choice: "accepted" | "declined") {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // storage unavailable -- nothing to persist, just hide it for this visit.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 inset-x-4 sm:inset-x-auto sm:right-4 sm:left-auto sm:max-w-md z-40 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Cookie className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-300 leading-relaxed">
            We use cookies to keep you signed in, remember your preferences, and understand how
            UiDive is used.{" "}
            <Link href="/legal" className="text-cyan-400 hover:underline font-semibold">
              Learn more
            </Link>
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => choose("declined")}
              className="text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3.5 py-1.5 rounded-full transition-colors"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => choose("accepted")}
              className="text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
