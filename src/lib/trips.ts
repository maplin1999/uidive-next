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
  description: string;
  location: string;
  trip_type: "shore" | "boat";
  activity_type: "scuba" | "freediving";
  difficulty: "Easy" | "Moderate" | "Advanced";
  max_depth: string;
  visibility: string;
  water_temp: string;
  swell: string;
  wind: string;
  tide: string;
  current: string;
  conditions_updated_at: string | null;
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

export interface HostReviewStats {
  avg_rating: number;
  review_count: number;
}

// Loads every active trip plus the review-stats views alongside it, same
// pairing the old site's loadTrips()/loadReviewStats() did -- every place a
// rating shows (Top Picks, search cards, "Hosted by" lines) needs all three
// at once.
export async function fetchTrips(): Promise<{
  trips: DiveTrip[];
  tripReviewStatsById: Record<string, { avg_rating: number; review_count: number }>;
  hostReviewStatsById: Record<string, HostReviewStats>;
}> {
  const [tripsRes, reviewRes, hostReviewRes] = await Promise.all([
    supabase
      .from("dive_trips")
      .select("*, profiles!host_id(name, avatar_url)")
      .eq("status", "active")
      .order("scheduled_date", { ascending: true }),
    supabase.from("trip_review_stats").select("trip_id, avg_rating, review_count"),
    supabase.from("host_review_stats").select("host_id, avg_rating, review_count"),
  ]);

  if (tripsRes.error) throw tripsRes.error;

  const tripReviewStatsById: Record<string, { avg_rating: number; review_count: number }> = {};
  if (!reviewRes.error) {
    (reviewRes.data || []).forEach((r) => {
      tripReviewStatsById[r.trip_id] = r;
    });
  }

  const hostReviewStatsById: Record<string, HostReviewStats> = {};
  if (!hostReviewRes.error) {
    (hostReviewRes.data || []).forEach((r) => {
      hostReviewStatsById[r.host_id] = r;
    });
  }

  return { trips: (tripsRes.data || []) as DiveTrip[], tripReviewStatsById, hostReviewStatsById };
}

// Mirrors confirmBooking()'s RPC call in the old app.js -- books for free
// right away (no real payment gateway is wired up), capacity-checked and
// price-computed atomically on the server by book_trip().
export async function bookTrip(
  tripId: string,
  price: number,
  equipment: Record<string, boolean>
): Promise<{ bookingId: string; spotsLeft: number }> {
  const { data, error } = await supabase.rpc("book_trip", {
    p_trip_id: tripId,
    p_price: price,
    p_equipment: equipment,
  });
  if (error) throw error;
  const row = data?.[0];
  if (!row) throw new Error("Could not complete booking -- please try again.");
  return { bookingId: row.booking_id, spotsLeft: row.spots_left };
}

export function formatRelativeTime(isoString: string | null): string {
  if (!isoString) return "";
  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export const EQUIPMENT_ITEMS: { id: string; label: string }[] = [
  { id: "wetsuit", label: "Wetsuit / Drysuit" },
  { id: "bcd", label: "BCD" },
  { id: "regulator", label: "Regulator Set" },
  { id: "fins", label: "Fins" },
  { id: "mask", label: "Mask & Snorkel" },
  { id: "computer", label: "Dive Computer" },
  { id: "weights", label: "Weights & Belt" },
  { id: "tank", label: "Tank / Cylinder" },
];

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
