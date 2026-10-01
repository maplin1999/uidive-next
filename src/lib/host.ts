import { supabase } from "@/lib/supabase";

export interface HostStatus {
  host_type: string;
  business_name: string;
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  rejection_reason: string | null;
}

export async function fetchHostStatus(userId: string): Promise<HostStatus | null> {
  const { data, error } = await supabase
    .from("host_profiles")
    .select("host_type, business_name, verification_status, rejection_reason")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export interface HostApplicationFields {
  hostType: string;
  businessName: string;
  displayBio: string;
  website: string;
  location: string;
  certAgency: string;
  certNumber: string;
  businessRegNumber: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  yearsExperience: number;
}

const HOST_DOC_TYPES = ["cert_card", "insurance", "business_registration"] as const;
export type HostDocType = (typeof HOST_DOC_TYPES)[number];

// Mirrors submitHostApplication() in the old app.js: the RPC call first
// (this is what actually flips account_type / creates the host_profiles
// row), then best-effort document uploads after -- a single failed upload
// shouldn't undo the application itself.
export async function submitHostApplication(
  userId: string,
  fields: HostApplicationFields,
  files: Partial<Record<HostDocType, File>>
): Promise<void> {
  const { error: rpcError } = await supabase.rpc("submit_host_application", {
    p_host_type: fields.hostType,
    p_business_name: fields.businessName,
    p_display_bio: fields.displayBio,
    p_website: fields.website,
    p_location: fields.location,
    p_cert_agency: fields.certAgency,
    p_cert_number: fields.certNumber,
    p_business_registration_number: fields.businessRegNumber,
    p_insurance_provider: fields.insuranceProvider,
    p_insurance_policy_number: fields.insurancePolicyNumber,
    p_years_experience: fields.yearsExperience,
  });
  if (rpcError) throw rpcError;

  for (const docType of HOST_DOC_TYPES) {
    const file = files[docType];
    if (!file) continue;

    const ext = file.name.split(".").pop();
    const path = `${userId}/${docType}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("host-verification-docs")
      .upload(path, file);

    if (uploadError) {
      console.warn(`Could not upload ${docType}:`, uploadError);
      continue;
    }

    await supabase
      .from("host_verification_documents")
      .insert({ host_user_id: userId, doc_type: docType, file_path: path, file_name: file.name });
  }
}

export interface HostTrip {
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
  price: number;
  capacity: number;
  spots_booked: number;
  scheduled_date: string | null;
  scheduled_time: string;
  image_url: string;
  highlight: string;
  conditions_label: string;
  status: "active" | "cancelled";
}

export interface HostBookingRow {
  trip_id: string;
  status: string;
  price_paid: number;
}

export interface HostReviewStats {
  avg_rating: number;
  review_count: number;
}

export async function fetchHostDashboard(userId: string): Promise<{
  trips: HostTrip[];
  bookings: HostBookingRow[];
  reviewStats: HostReviewStats | null;
}> {
  const { data: trips, error: tripsError } = await supabase
    .from("dive_trips")
    .select("*")
    .eq("host_id", userId)
    .order("scheduled_date", { ascending: true });
  if (tripsError) throw tripsError;

  const tripIds = (trips || []).map((t) => t.id);
  let bookings: HostBookingRow[] = [];
  if (tripIds.length > 0) {
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select("trip_id, status, price_paid")
      .in("trip_id", tripIds);
    if (bookingsError) throw bookingsError;
    bookings = bookingsData || [];
  }

  const { data: reviewStats } = await supabase
    .from("host_review_stats")
    .select("avg_rating, review_count")
    .eq("host_id", userId)
    .maybeSingle();

  return { trips: (trips || []) as HostTrip[], bookings, reviewStats: reviewStats || null };
}

export interface TripFormFields {
  title: string;
  description: string;
  location: string;
  tripType: string;
  activityType: string;
  difficulty: string;
  maxDepth: string;
  visibility: string;
  waterTemp: string;
  swell: string;
  wind: string;
  tide: string;
  current: string;
  price: number;
  capacity: number;
  scheduledDate: string | null;
  scheduledTime: string;
  imageUrl: string;
  highlight: string;
  conditionsLabel: string;
}

// Lat/lng geocoding (the old site's geocodeLocation() call) is left out --
// both RPCs default those params to null, so trips just won't have a live
// map pin yet. A real geocoding integration is future work, not a Host
// Dashboard-specific gap.
//
// p_description/p_activity_type were added here to restore parity with the
// old site's trip form (both columns already exist on dive_trips -- see
// src/lib/trips.ts). If create_trip/update_trip in Supabase haven't been
// updated to accept these two params, trip creation/editing will start
// failing with a Postgres "function not found" error -- check the RPC
// definitions first if that happens after this deploy.
export async function createTrip(fields: TripFormFields): Promise<void> {
  const { error } = await supabase.rpc("create_trip", {
    p_title: fields.title,
    p_description: fields.description,
    p_location: fields.location,
    p_trip_type: fields.tripType,
    p_activity_type: fields.activityType,
    p_difficulty: fields.difficulty,
    p_max_depth: fields.maxDepth,
    p_visibility: fields.visibility,
    p_water_temp: fields.waterTemp,
    p_swell: fields.swell,
    p_wind: fields.wind,
    p_tide: fields.tide,
    p_current: fields.current,
    p_price: fields.price,
    p_capacity: fields.capacity,
    p_scheduled_date: fields.scheduledDate,
    p_scheduled_time: fields.scheduledTime,
    p_image_url: fields.imageUrl,
    p_highlight: fields.highlight,
    p_conditions_label: fields.conditionsLabel,
  });
  if (error) throw error;
}

export async function updateTrip(tripId: string, fields: TripFormFields): Promise<void> {
  const { error } = await supabase.rpc("update_trip", {
    p_trip_id: tripId,
    p_title: fields.title,
    p_description: fields.description,
    p_location: fields.location,
    p_trip_type: fields.tripType,
    p_activity_type: fields.activityType,
    p_difficulty: fields.difficulty,
    p_max_depth: fields.maxDepth,
    p_visibility: fields.visibility,
    p_water_temp: fields.waterTemp,
    p_swell: fields.swell,
    p_wind: fields.wind,
    p_tide: fields.tide,
    p_current: fields.current,
    p_price: fields.price,
    p_capacity: fields.capacity,
    p_scheduled_date: fields.scheduledDate,
    p_scheduled_time: fields.scheduledTime,
    p_image_url: fields.imageUrl,
    p_highlight: fields.highlight,
    p_conditions_label: fields.conditionsLabel,
  });
  if (error) throw error;
}

export async function cancelTrip(tripId: string): Promise<void> {
  const { error } = await supabase.rpc("cancel_trip", { p_trip_id: tripId });
  if (error) throw error;
}

export interface RosterDiver {
  diver_user_id: string;
  diver_name: string;
  diver_avatar_url: string;
  diver_cert: string;
  is_you: boolean;
}

export async function fetchTripRoster(tripId: string): Promise<RosterDiver[]> {
  const { data, error } = await supabase.rpc("get_trip_roster", { p_trip_id: tripId });
  if (error) throw error;
  return data || [];
}
