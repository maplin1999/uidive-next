import { supabase } from "@/lib/supabase";

export interface MyBooking {
  id: string;
  trip_id: string;
  price_paid: number;
  status: "confirmed" | "refunded" | "cancelled";
  booked_at: string;
  dive_trips: {
    title: string;
    location: string;
    scheduled_date: string | null;
    scheduled_time: string;
  } | null;
}

export interface MyPost {
  id: string;
  caption: string;
  image_url: string;
  location_name: string;
  created_at: string;
  corals_awarded: boolean;
}

// Mirrors renderMyBookings() in the old app.js -- trimmed to the fields the
// simple list view actually shows. The old site's full booking-detail modal
// (roster, cancel, reviews) is a separate subsystem, not migrated yet; this
// just lists what you've booked.
export async function fetchMyBookings(userId: string): Promise<MyBooking[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      "id, trip_id, price_paid, status, booked_at, dive_trips(title, location, scheduled_date, scheduled_time)"
    )
    .eq("user_id", userId)
    .order("booked_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as MyBooking[];
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
