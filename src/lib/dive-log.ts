import { supabase } from "@/lib/supabase";

// Mirrors public.dive_logs (see add-dive-logs.sql). Private to the owner --
// only ever fetched/written for the signed-in user themselves, never for
// someone else's profile (their public "Dives" count comes from
// fetchDiveCount()/dive_log_stats instead, see below).
export interface DiveLog {
  id: string;
  user_id: string;
  booking_id: string | null;
  dive_date: string;
  location: string;
  dive_site: string;
  depth_m: number | null;
  duration_min: number | null;
  buddy_name: string;
  notes: string;
  equipment: string[];
  created_at: string;
  updated_at: string;
}

export interface DiveLogInput {
  dive_date: string;
  location: string;
  dive_site?: string;
  depth_m?: number | null;
  duration_min?: number | null;
  buddy_name?: string;
  notes?: string;
  equipment?: string[];
  booking_id?: string | null;
}

// Full logbook for the signed-in owner, newest dive first -- powers the
// logbook list opened from their own "Dives" stat.
export async function fetchDiveLogs(userId: string): Promise<DiveLog[]> {
  const { data, error } = await supabase
    .from("dive_logs")
    .select("*")
    .eq("user_id", userId)
    .order("dive_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchDiveLog(id: string): Promise<DiveLog | null> {
  const { data, error } = await supabase.from("dive_logs").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data || null;
}

// The public, read-only count shown on any profile (own or someone else's)
// -- backed by the dive_log_stats view, which is reachable regardless of
// the dive_logs row-level privacy since it only ever reports a count.
export async function fetchDiveCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("dive_log_stats")
    .select("dive_count")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.dive_count ?? 0;
}

// Batch version for lists of profiles (explore page, search results, etc.)
// so each card doesn't fire its own round trip.
export async function fetchDiveCounts(userIds: string[]): Promise<Record<string, number>> {
  if (userIds.length === 0) return {};
  const { data, error } = await supabase.from("dive_log_stats").select("user_id, dive_count").in("user_id", userIds);
  if (error) throw error;

  const byUser: Record<string, number> = {};
  (data || []).forEach((row) => {
    byUser[row.user_id] = row.dive_count;
  });
  return byUser;
}

export async function createDiveLog(userId: string, input: DiveLogInput): Promise<DiveLog> {
  const { data, error } = await supabase
    .from("dive_logs")
    .insert({
      user_id: userId,
      booking_id: input.booking_id ?? null,
      dive_date: input.dive_date,
      location: input.location,
      dive_site: input.dive_site ?? "",
      depth_m: input.depth_m ?? null,
      duration_min: input.duration_min ?? null,
      buddy_name: input.buddy_name ?? "",
      notes: input.notes ?? "",
      equipment: input.equipment ?? [],
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateDiveLog(id: string, input: DiveLogInput): Promise<DiveLog> {
  const { data, error } = await supabase
    .from("dive_logs")
    .update({
      dive_date: input.dive_date,
      location: input.location,
      dive_site: input.dive_site ?? "",
      depth_m: input.depth_m ?? null,
      duration_min: input.duration_min ?? null,
      buddy_name: input.buddy_name ?? "",
      notes: input.notes ?? "",
      equipment: input.equipment ?? [],
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDiveLog(id: string): Promise<void> {
  const { error } = await supabase.from("dive_logs").delete().eq("id", id);
  if (error) throw error;
}

// Whether a given booking already has a logged dive -- lets the booking UI
// show "View in Dive Log" instead of "Add to Dive Log" once it's done.
export async function fetchDiveLogByBooking(bookingId: string): Promise<DiveLog | null> {
  const { data, error } = await supabase.from("dive_logs").select("*").eq("booking_id", bookingId).maybeSingle();
  if (error) throw error;
  return data || null;
}

export function formatDiveDate(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
