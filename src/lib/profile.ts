import { supabase } from "@/lib/supabase";

export interface BookingTrip {
  id: string;
  title: string;
  location: string;
  scheduled_date: string | null;
  scheduled_time: string;
  visibility: string;
  water_temp: string;
  swell: string;
  wind: string;
  tide: string;
  current: string;
  conditions_updated_at: string | null;
  host_id: string | null;
  profiles: { name: string; avatar_url: string } | null;
}

export interface TripReview {
  rating: number;
  comment: string;
}

export interface MyBooking {
  id: string;
  trip_id: string;
  price_paid: number;
  status: "confirmed" | "refunded" | "cancelled";
  booked_at: string;
  equipment: Record<string, boolean>;
  dive_trips: BookingTrip | null;
  trip_reviews: TripReview | TripReview[] | null;
}

// Normalizes trip_reviews -- PostgREST returns the reverse side of a 1:1 FK
// as either a bare object or a one-item array depending on version.
export function getBookingReview(booking: MyBooking): TripReview | null {
  const r = booking.trip_reviews;
  if (!r) return null;
  return Array.isArray(r) ? r[0] || null : r;
}

// A trip scheduled for TODAY counts as "passed" too -- otherwise a diver on
// a 7am trip couldn't leave a review until midnight. scheduled_date doesn't
// carry a reliable time-of-day to check more precisely than "today or
// earlier."
export function tripHasPassed(trip: BookingTrip | null): boolean {
  if (!trip || !trip.scheduled_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return trip.scheduled_date <= today;
}

export interface MyPost {
  id: string;
  caption: string;
  image_url: string;
  location_name: string;
  created_at: string;
  corals_awarded: boolean;
}

// Mirrors renderMyBookings() in the old app.js, now carrying everything the
// full booking-detail modal needs too (conditions, equipment, host, and any
// linked review) rather than just the summary list's fields.
export async function fetchMyBookings(userId: string): Promise<MyBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, trip_id, price_paid, status, booked_at, equipment,
       dive_trips(id, title, location, scheduled_date, scheduled_time, visibility, water_temp, swell, wind, tide, current, conditions_updated_at, host_id, profiles!host_id(name, avatar_url)),
       trip_reviews(rating, comment)`
    )
    .eq("user_id", userId)
    .order("booked_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as MyBooking[];
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_booking", { p_booking_id: bookingId });
  if (error) throw error;
}

export async function submitTripReview(
  bookingId: string,
  rating: number,
  comment: string
): Promise<TripReview> {
  const { data, error } = await supabase.rpc("submit_trip_review", {
    p_booking_id: bookingId,
    p_rating: rating,
    p_comment: comment,
  });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function fetchMyPosts(userId: string): Promise<MyPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, caption, image_url, location_name, created_at, corals_awarded")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// The fields Edit Profile actually lets you change -- avatar upload needs
// Supabase Storage, which is its own separate migration, so it's left out
// here for now.
// A short, stable, shareable ID derived from the user's real database id --
// same formula as the old site's diverIdFromUserId().
export function diverIdFromUserId(userId: string): string {
  return "DIV-" + userId.replace(/-/g, "").slice(0, 6).toUpperCase();
}

export async function updateProfile(
  userId: string,
  fields: { cert: string; location: string; bio: string }
): Promise<void> {
  const { error } = await supabase.from("profiles").update(fields).eq("id", userId);
  if (error) throw error;
}
