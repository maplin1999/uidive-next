"use client";

import { useState } from "react";

// A minimal per-page toast, shared across pages that need one (first Home,
// now Community). Not a global/app-wide toast system yet -- that's worth
// building once auth lands and actions need to report success/failure from
// anywhere, not just the page that's currently mounted.
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  function showToast(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3000);
  }

  return { message, showToast };
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-700 text-slate-100 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl max-w-[90vw] text-center">
      {message}
    </div>
  );
}
