import { supabase } from "@/lib/supabase";

export interface PublicProfile {
  id: string;
  name: string;
  cert: string;
  location: string;
  bio: string;
  avatar_url: string;
  dives: number;
  corals: number;
  diver_id: string;
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, cert, location, bio, avatar_url, dives, corals, diver_id")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export interface PublicPost {
  id: string;
  image_url: string;
  caption: string;
  location_name: string;
  created_at: string;
  corals_awarded: boolean;
}

export async function fetchPublicProfilePosts(userId: string): Promise<PublicPost[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, image_url, caption, location_name, created_at, corals_awarded")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(9);
  if (error) throw error;
  return data || [];
}

export async function fetchBuddiesCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  return count || 0;
}

export type FriendshipStatus = "none" | "pending" | "accepted";

// Mirrors viewPublicProfile()'s buddy-status lookup -- checks a friendship
// in either direction between the two people.
export async function fetchFriendshipStatus(meId: string, otherId: string): Promise<FriendshipStatus> {
  const { data } = await supabase
    .from("friendships")
    .select("status")
    .or(
      `and(requester_id.eq.${meId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${meId})`
    )
    .limit(1);
  const row = data?.[0];
  if (!row) return "none";
  return row.status === "accepted" ? "accepted" : row.status === "pending" ? "pending" : "none";
}

export async function isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_blocks")
    .select("blocked_id")
    .eq("blocker_id", blockerId)
    .eq("blocked_id", blockedId)
    .maybeSingle();
  return !!data;
}

export async function toggleBlockUser(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("toggle_user_block", { p_user_id: userId });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return !!row?.blocked;
}

export type ReportTargetType = "post" | "comment" | "user";

export const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Hate speech",
  "Inappropriate content",
  "Impersonation",
  "Other",
];

export async function submitReport(
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
  details: string
): Promise<void> {
  const { error } = await supabase.rpc("submit_report", {
    p_target_type: targetType,
    p_target_id: targetId,
    p_reason: reason,
    p_details: details,
  });
  if (error) throw error;
}
