// Dive-boat silhouette -- the "goal" end of the Ocean Conservation progress
// banner's track, paired with DiverIcon. Hand-drawn (hull trapezoid, small
// cabin block, mast + sail) since lucide-react has no dive-boat icon to
// port from. fill/stroke="currentColor" so it sizes/colors the same way.
export function DiveBoatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M2.75 14.5h18.5l-2.1 4.2a2 2 0 0 1-1.79 1.1H6.64a2 2 0 0 1-1.79-1.1l-2.1-4.2z"
        fill="currentColor"
      />
      <rect x="8" y="10.25" width="5" height="4" rx="0.75" fill="currentColor" />
      <path d="M12 3.5v6.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M12.4 3.8 16.6 9h-4.2z" fill="currentColor" />
    </svg>
  );
}
