"use client";

import { DiveTrip, ReviewStats, difficultyAccent, formatTripDate } from "@/lib/trips";
import { useLocale } from "@/components/i18n/LocaleContext";
import { useCurrency } from "@/components/currency/CurrencyContext";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80";

// The full-detail card used in the search grid. Migrated from
// renderSearchTrips()'s template string in the old app.js -- including its
// cover photo, "Fully Booked" ribbon, and opacity-70 dim on a sold-out trip
// (the main card originally shipped without these -- TopPickCard below had
// the photo, this one didn't; this restores parity between the two).
export function TripCard({
  trip,
  rating,
  onOpen,
}: {
  trip: DiveTrip;
  rating: ReviewStats;
  onOpen: (trip: DiveTrip) => void;
}) {
  const { t } = useLocale();
  const { formatPrice } = useCurrency();
  const accent = difficultyAccent(trip.difficulty);
  const spotsLeft = trip.capacity - trip.spots_booked;
  const isFull = spotsLeft <= 0;
  const groupLabel = isFull ? t.tripCard.fullyBooked : `${trip.spots_booked}/${trip.capacity} ${t.tripCard.divers}`;

  return (
    <div
      onClick={() => onOpen(trip)}
      className={`trip-card rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all overflow-hidden relative ${
        isFull ? "opacity-70" : ""
      }`}
    >
      {isFull && (
        <span className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-wide bg-rose-500/90 text-white px-2.5 py-1 rounded-full shadow-md">
          {t.tripCard.fullyBooked}
        </span>
      )}
      <div className="relative h-32 overflow-hidden bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element -- remote
            Supabase Storage / Unsplash URLs, with a runtime fallback on
            error, same as TopPickCard below. */}
        <img
          src={trip.image_url || FALLBACK_IMG}
          alt={trip.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMG;
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-5 space-y-4">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
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
              {trip.activity_type === "freediving" ? t.tripCard.freeDiving : t.tripCard.scuba} •{" "}
              {trip.trip_type === "boat" ? t.tripCard.boatCharter : t.tripCard.shoreDive} • {formatTripDate(trip)}
            </p>
          </div>
          <span className="text-xl font-black text-cyan-400 shrink-0">{formatPrice(trip.price)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 text-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">{t.tripCard.visibility}</span>
            <strong className="text-cyan-400">{trip.visibility}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">{t.tripCard.group}</span>
            <strong className={spotsLeft <= 0 ? "text-rose-400" : ""}>{groupLabel}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">{t.tripCard.reward}</span>
            <strong className="text-amber-400">+50  </strong>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const { formatPrice } = useCurrency();

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
        <span className="always-dark absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-400 border border-amber-500/30 flex items-center gap-1">
          ★ {rating.avg.toFixed(1)}
          {rating.count > 0 ? ` (${rating.count})` : ""}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-extrabold text-sm text-slate-100 truncate">{trip.title}</h3>
        <p className="text-[11px] text-slate-400 truncate">
          {trip.location} • {formatPrice(trip.price)}
        </p>
      </div>
    </div>
  );
}
