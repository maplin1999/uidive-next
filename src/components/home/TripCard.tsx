"use client";

import { DiveTrip, ReviewStats, difficultyAccent, formatTripDate } from "@/lib/trips";

// The full-detail card used in the search grid. Migrated from
// renderSearchTrips()'s template string in the old app.js -- same markup,
// same classes, just JSX instead of a string join. Clicking opens the dive
// detail modal in the old site; that modal hasn't been migrated yet, so
// onOpen is a no-op placeholder for now (wired up once it exists).
export function TripCard({
  trip,
  rating,
  onOpen,
}: {
  trip: DiveTrip;
  rating: ReviewStats;
  onOpen: (trip: DiveTrip) => void;
}) {
  const accent = difficultyAccent(trip.difficulty);
  const spotsLeft = trip.capacity - trip.spots_booked;
  const groupLabel = spotsLeft <= 0 ? "Fully Booked" : `${trip.spots_booked}/${trip.capacity} Divers`;

  return (
    <div
      onClick={() => onOpen(trip)}
      className="trip-card p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer space-y-4 transition-all"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap">
            <h3 className="font-extrabold text-base text-slate-100">{trip.title}</h3>
            <span
              className={`${accent.tag} border text-[10px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap`}
            >
              {accent.label}
            </span>
            {rating.count > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                ★ {rating.avg.toFixed(1)}{" "}
                <span className="text-slate-500 font-semibold">({rating.count})</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {trip.trip_type === "boat" ? "Boat Charter" : "Shore Dive"} • {formatTripDate(trip)}
          </p>
        </div>
        <span className="text-xl font-black text-cyan-400 shrink-0">${Number(trip.price)}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Visibility</span>
          <strong className="text-cyan-400">{trip.visibility}</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Group</span>
          <strong className={spotsLeft <= 0 ? "text-rose-400" : ""}>{groupLabel}</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Reward</span>
          <strong className="text-amber-400">+50 🪸</strong>
        </div>
      </div>
    </div>
  );
}

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80";

// The compact horizontal-scroll card used in Top Picks. Migrated from
// renderTopPicks()'s template string.
export function TopPickCard({
  trip,
  rating,
  onOpen,
}: {
  trip: DiveTrip;
  rating: ReviewStats;
  onOpen: (trip: DiveTrip) => void;
}) {
  return (
    <div
      onClick={() => onOpen(trip)}
      className="group shrink-0 w-64 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all overflow-hidden cursor-pointer shadow-lg"
    >
      <div className="relative h-32 overflow-hidden bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote
            Supabase Storage / Unsplash URLs, with a runtime fallback on
            error, same as the old site's onerror handler. next/image's
            fixed domain allowlist doesn't fit arbitrary host-uploaded URLs
            well here; revisit once Storage uploads are migrated. */}
        <img
          src={trip.image_url || FALLBACK_IMG}
          alt={trip.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMG;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1">
          ★ {rating.avg.toFixed(1)}
          {rating.count > 0 ? ` (${rating.count})` : ""}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-extrabold text-sm text-slate-100 truncate">{trip.title}</h3>
        <p className="text-[11px] text-slate-400 truncate">
          {trip.location} • ${Number(trip.price)}
        </p>
      </div>
    </div>
  );
}
