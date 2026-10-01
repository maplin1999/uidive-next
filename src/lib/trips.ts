import { supabase } from "@/lib/supabase";

// Mirrors public.dive_trips (see supabase-schema.sql) plus the joined host
// profile. Only the columns the Home page actually renders are typed here;
// add more as later pages need them.
export interface HostProfile {
  name: string;
  avatar_url: string;
}

export interface DiveTrip {
  id: string;
  title: string;
  location: string;
  trip_type: "shore" | "boat";
  difficulty: "Easy" | "Moderate" | "Advanced";
  visibility: string;
  water_temp: string;
  swell: string;
  rating: number;
  price: number;
  capacity: number;
  spots_booked: number;
  scheduled_date: string | null;
  scheduled_time: string;
  image_url: string;
  highlight: string;
  host_id: string | null;
  profiles: HostProfile | null;
}

export interface ReviewStats {
  avg: number;
  count: number;
  real: boolean;
}

// Loads every active trip plus the review-stats views alongside it, same
// pairing the old site's loadTrips()/loadReviewStats() did -- every place a
// rating shows (Top Picks, search cards) needs both at once.
export async function fetchTrips(): Promise<{
  trips: DiveTrip[];
  tripReviewStatsById: Record<string, { avg_rating: number; review_count: number }>;
}> {
  const [tripsRes, reviewRes] = await Promise.all([
    supabase
      .from("dive_trips")
      .select("*, profiles!host_id(name, avatar_url)")
      .eq("status", "active")
      .order("scheduled_date", { ascending: true }),
    supabase.from("trip_review_stats").select("trip_id, avg_rating, review_count"),
  ]);

  if (tripsRes.error) throw tripsRes.error;

  const tripReviewStatsById: Record<string, { avg_rating: number; review_count: number }> = {};
  if (!reviewRes.error) {
    (reviewRes.data || []).forEach((r) => {
      tripReviewStatsById[r.trip_id] = r;
    });
  }

  return { trips: (tripsRes.data || []) as DiveTrip[], tripReviewStatsById };
}

// A trip's real rating once it has at least one review, otherwise the
// original seeded placeholder value (same rule as the old site: a
// placeholder only until genuine feedback exists, never alongside it).
export function effectiveTripRating(
  trip: DiveTrip,
  statsById: Record<string, { avg_rating: number; review_count: number }>
): ReviewStats {
  const stats = statsById[trip.id];
  if (stats && stats.review_count > 0) {
    return { avg: Number(stats.avg_rating), count: stats.review_count, real: true };
  }
  return { avg: Number(trip.rating), count: 0, real: false };
}

export function difficultyAccent(difficulty: DiveTrip["difficulty"]) {
  if (difficulty === "Advanced")
    return {
      tag: "bg-purple-500/10 text-purple-300 border-purple-500/30",
      label: "Advanced",
    };
  if (difficulty === "Moderate")
    return {
      tag: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
      label: "Moderate",
    };
  return {
    tag: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    label: "Beginner Friendly",
  };
}

export function formatTripDate(trip: DiveTrip): string {
  if (!trip.scheduled_date) return trip.scheduled_time || "";
  const d = new Date(trip.scheduled_date + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return trip.scheduled_time ? `${dateStr} • ${trip.scheduled_time}` : dateStr;
}

// Pure date helpers for the When dropdown's "This Weekend"/"Next Weekend"
// presets (same math as the old site's upcomingSaturday()/isoDate()).
export function upcomingSaturday(offsetWeeks: number, from?: Date): Date {
  const d = from ? new Date(from) : new Date();
  d.setHours(0, 0, 0, 0);
  const daysUntilSat = (6 - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + daysUntilSat + offsetWeeks * 7);
  return d;
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
