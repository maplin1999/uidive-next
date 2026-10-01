"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

// A minimal per-page toast, shared across pages that need one. Not a
// global/app-wide toast system yet -- that's worth building once actions
// need to report success/failure from anywhere, not just the page that's
// currently mounted.
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  function showToast(text: string) {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 3000);
  }

  return { message, showToast };
}

// Styling/positioning/animation ported from the old site's #toast +
// showToast(): bold emerald (high-contrast "success" color, not a neutral
// gray), a sparkles icon, top-of-screen, and a slide-up/fade-in transition
// rather than popping in instantly.
export function Toast({ message }: { message: string | null }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      // Mount off-state first, then flip to visible on the next frame so
      // the transition actually runs instead of starting already-settled.
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
  }, [message]);

  if (!message) return null;
  return (
    <div
      className={`fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 bg-emerald-500 text-slate-950 px-5 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center space-x-2 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <Sparkles className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
