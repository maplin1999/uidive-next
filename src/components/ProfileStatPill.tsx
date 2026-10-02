// Pill-shaped "frosted glass" stat chip for a profile header's Dives/
// Buddies/Corals row. Reuses the same sunken-panel treatment (panel-sunken +
// bg-slate-950/60 + backdrop-blur) as the hero search bar and leaderboard
// runner-up cards, so it already has a light-mode-safe background via
// globals.css rather than needing its own always-dark hook. Renders as a
// <button> when onClick is given (Buddies, which opens a buddies list), a
// plain <div> otherwise. Shared between the signed-in Profile page and
// PublicProfileModal so every profile header (yours or anyone else's) stays
// visually identical -- and so future profile UI only needs to change here.
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
  const borderClass = accent === "amber" ? "border-amber-500/30" : "border-slate-800/80";
  const className = `panel-sunken inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border ${borderClass} ${
    onClick ? "hover:bg-slate-800/60 hover:border-cyan-500/40 transition-colors cursor-pointer" : ""
  }`;

  const content = (
    <>
      <span className={`text-xs font-black ${valueClass}`}>{Number(value).toLocaleString()}</span>
      <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wide">{label}</span>
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
