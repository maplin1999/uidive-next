import { supabase } from "@/lib/supabase";

// Migrated from the old site's Admin Panel (openAdminHostReviewModal() and
// friends in app.js) -- host-application verification and reported-content
// moderation, both gated to currentUser.is_admin there and to whoever this
// page/modal is shown to here (callers are expected to only render it for
// an admin, same as the old site only ever toggled .admin-nav-el visible
// for one).

export interface PendingHostApplication {
  user_id: string;
  host_type: string;
  business_name: string;
  display_bio: string;
  location: string;
  cert_agency: string;
  cert_number: string;
  years_experience: number;
  verification_status: string;
  applied_at: string;
  profiles: { name: string; avatar_url: string } | null;
}

export async function fetchPendingHostApplications(): Promise<PendingHostApplication[]> {
  const { data, error } = await supabase
    .from("host_profiles")
    .select(
      "user_id, host_type, business_name, display_bio, location, cert_agency, cert_number, years_experience, verification_status, applied_at, profiles!user_id(name, avatar_url)"
    )
    .eq("verification_status", "pending")
    .order("applied_at", { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as PendingHostApplication[];
}

export interface HostApplicationDocument {
  doc_type: string;
  file_path: string;
  file_name: string;
  url: string | null;
}

// These live in a private storage bucket, so a plain public URL won't work --
// a short-lived signed URL is fetched instead, same as the old site.
export async function fetchHostApplicationDocuments(
  hostUserId: string
): Promise<HostApplicationDocument[]> {
  const { data: docs, error } = await supabase
    .from("host_verification_documents")
    .select("doc_type, file_path, file_name")
    .eq("host_user_id", hostUserId);

  if (error) throw error;
  if (!docs || docs.length === 0) return [];

  const withUrls: HostApplicationDocument[] = [];
  for (const doc of docs) {
    const { data: signed } = await supabase.storage
      .from("host-verification-docs")
      .createSignedUrl(doc.file_path, 300);
    withUrls.push({ ...doc, url: signed ? signed.signedUrl : null });
  }
  return withUrls;
}

export async function approveHostApplication(hostUserId: string): Promise<void> {
  const { error } = await supabase.rpc("review_host_application", {
    p_host_user_id: hostUserId,
    p_new_status: "verified",
    p_rejection_reason: "",
  });
  if (error) throw error;
}

export async function rejectHostApplication(hostUserId: string, reason: string): Promise<void> {
  const { error } = await supabase.rpc("review_host_application", {
    p_host_user_id: hostUserId,
    p_new_status: "rejected",
    p_rejection_reason: reason,
  });
  if (error) throw error;
}

export interface PendingReport {
  id: string;
  target_type: "post" | "comment" | "user";
  target_id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter_id: string;
  profiles: { name: string } | null;
}

export async function fetchPendingReports(): Promise<PendingReport[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("id, target_type, target_id, reason, details, created_at, reporter_id, profiles!reporter_id(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as PendingReport[];
}

export async function reviewReport(reportId: string, action: "dismiss" | "remove"): Promise<void> {
  const { error } = await supabase.rpc("review_report", { p_report_id: reportId, p_action: action });
  if (error) throw error;
}
