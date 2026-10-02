// Instagram-style stat for a profile header's Dives/Buddies/Corals row --
// bold number on top, small muted label beneath, no pill/border/background.
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
  const className = `flex flex-col items-center sm:items-start leading-tight ${
    onClick ? "hover:opacity-80 transition-opacity cursor-pointer" : ""
  }`;

  const content = (
    <>
      <span className={`text-sm sm:text-base font-black ${valueClass}`}>{Number(value).toLocaleString()}</span>
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
