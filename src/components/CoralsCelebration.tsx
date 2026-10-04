"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Migrated from the old site's celebrateCoralsEarned(): a compact,
// count-up celebration card shown after earning Corals (booking a trip,
// the daily claim, etc). Reusable anywhere that credits Corals.
export function CoralsCelebration({
  amount,
  title,
  onDone,
}: {
  amount: number;
  title: string;
  onDone: () => void;
}) {
  const { t } = useLocale();
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade/scale in on the next frame.
    const raf = requestAnimationFrame(() => setVisible(true));

    const duration = 500;
    const start = performance.now();
    let frame: number;
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayed(Math.round(progress * amount));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);

    const hideTimer = setTimeout(() => setVisible(false), 2000);
    const cleanupTimer = setTimeout(onDone, 2300);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(frame);
      clearTimeout(hideTimer);
      clearTimeout(cleanupTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <div
        className={`absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`relative bg-slate-900 border border-slate-800 rounded-3xl px-7 py-6 shadow-2xl flex items-center gap-4 max-w-xs mx-4 transition-all duration-300 ease-out ${
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl shrink-0">
           
        </div>
        <div className="text-left min-w-0">
          <p className="text-sm font-bold text-white truncate">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">+{displayed} {t.coralsCelebration.addedToBalanceSuffix}</p>
        </div>
      </div>
    </div>
  );
}
