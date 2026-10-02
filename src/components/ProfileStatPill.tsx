"use client";

import { useEffect, useRef, useState } from "react";

// Instagram-style stat for a profile header's Dives/Buddies/Corals row --
// bold number on top, small muted label beneath, no pill/border/background.
// Two bits of polish on top of the plain stacked layout:
//  - the number counts up from 0 on mount (ease-out, ~700ms) instead of
//    just appearing, so the header feels a little alive on first paint.
//  - hovering a stat (via the shared "group" wrapper) gently scales it and
//    adds a color-matched glow behind the number, whether or not it's
//    clickable -- a cheap, low-risk bit of life for a mostly-static card.
// Renders as a <button> when onClick is given (Buddies, which opens a
// buddies list), a plain <div> otherwise. Shared between the signed-in
// Profile page and PublicProfileModal so every profile header (yours or
// anyone else's) stays visually identical -- and so future profile UI only
// needs to change here.
export function ProfileStatPill({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: number;
  accent?: "cyan" | "amber";
  onClick?: () => void;
}) {
  const valueClass =
    accent === "amber" ? "text-amber-400" : accent === "cyan" ? "text-cyan-400" : "text-white";
  const glowClass =
    accent === "amber"
      ? "group-hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.65)]"
      : accent === "cyan"
      ? "group-hover:drop-shadow-[0_0_6px_rgba(34,211,238,0.65)]"
      : "group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]";

  const [displayValue, setDisplayValue] = useState(0);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    animated.current = true;
    const target = Number(value) || 0;
    const duration = 700;
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const className = `group flex flex-col items-center text-center leading-tight transition-transform duration-200 hover:scale-110 ${
    onClick ? "cursor-pointer" : ""
  }`;

  const content = (
    <>
      <span className={`text-sm sm:text-base font-black transition-[filter] duration-200 ${valueClass} ${glowClass}`}>
        {displayValue.toLocaleString()}
      </span>
      <span className="text-[10px] text-slate-400 font-semibold">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={className}>
        {content}
      </button>
    );
  }
  return <div className={className}>{content}</div>;
}
