"use client";

import { useEffect, useState } from "react";

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
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      <div
        className={`relative bg-slate-900 border border-amber-500/30 rounded-3xl px-8 py-6 shadow-2xl text-center space-y-1 transition-all duration-300 ${
          visible ? "scale-100" : "scale-95"
        }`}
      >
        <p className="text-sm font-bold text-amber-400">{title}</p>
        <p className="text-3xl font-black text-white">
          +{displayed} <span className="text-2xl">🪸</span>
        </p>
      </div>
    </div>
  );
}
