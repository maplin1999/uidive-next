"use client";

import { useEffect, useMemo, useState } from "react";
import { Compass, Flame, Sparkles } from "lucide-react";
import {
  DiveTrip,
  HostReviewStats,
  effectiveTripRating,
  fetchTrips,
} from "@/lib/trips";
import { HeroSearch, ActivityFilter } from "@/components/home/HeroSearch";
import { TrustStat } from "@/components/home/TrustStat";
import { TripCard, TopPickCard } from "@/components/home/TripCard";
import { DiveDetailModal } from "@/components/home/DiveDetailModal";
import { useToast, Toast } from "@/components/Toast";
import { ConservationBanner } from "@/components/home/ConservationBanner";

type TripTypeFilter = "all" | "shore" | "boat";

// The Home tab (#tab-home in the old site): hero search, the ocean
// conservation progress banner, the full trip grid, and the Top Picks
// spotlight row. This is the project's default/landing page now, replacing
// the earlier Supabase smoke-test placeholder -- that page did its job
// (proving the pipeline worked) and is no longer needed now that a real
// page exists. The daily Corals claim that used to live here moved to the
// Profile page -- see DailyStreakCard.
export default function HomePage() {
  const [trips, setTrips] = useState<DiveTrip[]>([]);
  const [reviewStats, setReviewStats] = useState<
    Record<string, { avg_rating: number; review_count: number }>
  >({});
  const [hostReviewStats, setHostReviewStats] = useState<Record<string, HostReviewStats>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const { message, showToast } = useToast();

  const [query, setQuery] = useState("");
  const [activity, setActivity] = useState<ActivityFilter>("all");
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [dateLabel, setDateLabel] = useState("Any Date");
  const [tripType, setTripType] = useState<TripTypeFilter>("all");
  const [selectedTrip, setSelectedTrip] = useState<DiveTrip | null>(null);

  const load = () => {
    fetchTrips()
      .then(({ trips, tripReviewStatsById, hostReviewStatsById }) => {
        setTrips(trips);
        setReviewStats(tripReviewStatsById);
        setHostReviewStats(hostReviewStatsById);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load dive trips:", err);
        setStatus("error");
      });
  };

  useEffect(() => {
    load();
  }, []);

  const filteredTrips = useMemo(() => {
    let result = trips;
    if (tripType !== "all") result = result.filter((t) => t.trip_type === tripType);
    if (activity === "scuba") result = result.filter((t) => (t.activity_type || "scuba") === "scuba");
    else if (activity === "freediving") result = result.filter((t) => t.activity_type === "freediving");
    if (dateFilter) result = result.filter((t) => t.scheduled_date === dateFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (t) => t.title.toLowerCase().includes(q) || t.location.toLowerCase().includes(q)
      );
    }
    return result;
  }, [trips, tripType, activity, dateFilter, query]);

  const topPicks = useMemo(
    () =>
      trips
        .slice()
        .sort(
          (a, b) =>
            effectiveTripRating(b, reviewStats).avg - effectiveTripRating(a, reviewStats).avg
        )
        .slice(0, 3),
    [trips, reviewStats]
  );

  function openDiveDetail(trip: DiveTrip) {
    setSelectedTrip(trip);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HERO */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-cyan-950/60 to-slate-900 border border-cyan-500/20 shadow-2xl">
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 space-y-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 uppercase tracking-wider w-fit">
              <Sparkles className="w-3.5 h-3.5" /> Scuba Booking &amp; Ocean Social Network
            </span>

            <p className="text-base sm:text-lg text-slate-400 max-w-3xl leading-snug tracking-tight whitespace-normal sm:whitespace-nowrap">
              Find dive trips near you, book your spot, and connect with divers who&apos;ve been
              there.
            </p>

            <HeroSearch
              trips={trips}
              query={query}
              onQueryChange={setQuery}
              activity={activity}
              onActivityChange={setActivity}
              dateFilter={dateFilter}
              dateLabel={dateLabel}
              onDateChange={(date, label) => {
                setDateFilter(date);
                setDateLabel(label);
              }}
              onSearch={() => {
                document.getElementById("trips-section")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />

            {/* Trust stats -- placeholder figures, same as the old site
                (no live aggregate-stats source wired up yet). TrustStat
                gives each tile the same count-up-on-mount + hover-glow
                treatment as the profile header's Dives/Buddies/Corals/Posts
                stats, for a consistent feel across the site. */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1">
              {[
                ["2,400+", "Dive Trips Booked"],
                ["180+", "Dive Sites"],
                ["9,000+", "Divers on UiDive"],
              ].map(([stat, label]) => (
                <TrustStat key={label} value={stat} label={label} />
              ))}
            </div>
          </div>
        </div>

        {/* OCEAN CONSERVATION */}
        <ConservationBanner onToast={showToast} />

        {/* TRIPS GRID */}
        <div id="trips-section" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-cyan-400" /> Find &amp; Book Dive Trips
            </h2>
            {status === "ready" && filteredTrips.length > 0 && (
              <p className="text-xs text-slate-400">
                {filteredTrips.length} dive trip{filteredTrips.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {(
              [
                ["all", "All Trips"],
                ["shore", "Shore Dives"],
                ["boat", "Boat Charters"],
              ] as [TripTypeFilter, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTripType(key)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  tripType === key
                    ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {status === "loading" &&
              [0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-32 bg-slate-800/60" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-2/3 bg-slate-800/60 rounded-lg" />
                    <div className="h-3 w-1/2 bg-slate-800/60 rounded-lg" />
                    <div className="h-14 bg-slate-800/40 rounded-2xl" />
                  </div>
                </div>
              ))}

            {status === "error" && (
              <p className="text-sm text-rose-400 col-span-full text-center py-8">
                Could not load dive trips -- please refresh.
              </p>
            )}

            {status === "ready" && filteredTrips.length === 0 && (
              <p className="text-sm text-slate-400 col-span-full text-center py-8">
                No dive trips match that search.
              </p>
            )}

            {status === "ready" &&
              filteredTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  rating={effectiveTripRating(trip, reviewStats)}
                  onOpen={openDiveDetail}
                />
              ))}
          </div>
        </div>

        {/* TOP PICKS */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-cyan-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5" /> This Week&apos;s Top Picks
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
            {status === "loading" &&
              [0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-64 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden animate-pulse"
                  aria-hidden="true"
                >
                  <div className="h-32 bg-slate-800/60" />
                  <div className="p-3 space-y-2">
                    <div className="h-3.5 w-3/4 bg-slate-800/60 rounded-lg" />
                    <div className="h-3 w-1/2 bg-slate-800/60 rounded-lg" />
                  </div>
                </div>
              ))}

            {status === "ready" && topPicks.length === 0 && (
              <p className="text-sm text-slate-400 py-4">No trips to feature yet.</p>
            )}

            {status === "ready" &&
              topPicks.map((trip) => (
                <TopPickCard
                  key={trip.id}
                  trip={trip}
                  rating={effectiveTripRating(trip, reviewStats)}
                  onOpen={openDiveDetail}
                />
              ))}
          </div>
        </div>
      </div>

      {selectedTrip && (
        <DiveDetailModal
          trip={selectedTrip}
          rating={effectiveTripRating(selectedTrip, reviewStats)}
          hostStats={selectedTrip.host_id ? hostReviewStats[selectedTrip.host_id] || null : null}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      <Toast message={message} />
    </main>
  );
}
