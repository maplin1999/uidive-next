"use client";

import { useEffect, useState } from "react";

// Count-up + hover-glow version of the homepage hero's "trust stats" tiles
// (Dive Trips Booked / Dive Sites / Divers on UiDive), matching the same
// treatment ProfileStatPill gives Dives/Buddies/Corals/Posts on a profile
// header: the number counts up (ease-out) whenever its value changes, and
// hovering the tile gently scales it with a glow behind the number. Kept as
// its own component rather than reusing ProfileStatPill since the visual
// language here is different (a bordered card with gradient text, not a
// plain stacked number+label) -- same animation idea, different chrome.
export function TrustStat({ value, label }: { value: string; label: string }) {
  // The source data is a display-ready string like "2,400+" -- pull out the
  // numeric target to animate (toLocaleString reapplies comma formatting)
  // and keep whatever non-digit suffix follows it (here always "+").
  const numeric = Number(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/[0-9,]/g, "");

  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(numeric * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [numeric]);

  return (
    <div className="group panel-sunken bg-slate-950/60 backdrop-blur-sm border border-slate-800/80 rounded-2xl px-2 py-2 sm:px-4 sm:py-2.5 text-center sm:text-left min-w-0 transition-transform duration-200 hover:scale-[1.04]">
      <div className="text-base sm:text-xl md:text-2xl font-extrabold bg-gradient-to-r from-cyan-300 to-amber-300 bg-clip-text text-transparent transition-[filter] duration-200 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]">
        {display.toLocaleString()}
        {suffix}
      </div>
      <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-normal sm:tracking-wider leading-tight">
        {label}
      </div>
    </div>
  );
}
