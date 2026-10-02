// Scuba-diver silhouette for the Ocean Conservation progress banner --
// not one of lucide-react's bundled icons, so hand-drawn as simple
// primitives (circle head, tapered body, two angled fins) rather than
// forcing a lookalike. fill="currentColor" so it sizes/colors like any
// lucide icon it sits next to. See DiveBoatIcon for its paired end-of-track
// icon.
export function DiverIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="12" cy="5.5" r="2.75" fill="currentColor" />
      <path
        d="M12 8.25c-2.6 0-4.6 1.9-4.6 5.1v3.1c0 .62.5 1.12 1.12 1.12.55 0 1.02-.4 1.11-.94l.57-3.38h3.6l.57 3.38c.09.55.56.94 1.11.94.62 0 1.12-.5 1.12-1.12v-3.1c0-3.2-2-5.1-4.6-5.1z"
        fill="currentColor"
      />
      <path d="M6.3 14.8 2.4 16.6a1 1 0 1 0 .84 1.82L7.3 16.5z" fill="currentColor" />
      <path d="M17.7 14.8 21.6 16.6a1 1 0 1 1-.84 1.82L16.7 16.5z" fill="currentColor" />
    </svg>
  );
}
