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
  equipped_avatar_id: string | null;
  equipped_calling_card_id: string | null;
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, name, cert, location, bio, avatar_url, dives, corals, diver_id, equipped_avatar_id, equipped_calling_card_id"
    )
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

export interface PublicHostBadge {
  host_type: "shop" | "divemaster" | "both" | string;
}

// Verified-host badge for someone else's public profile, ported from
// renderPublicProfileBadges(). host_profiles is publicly readable by RLS,
// so this works for signed-out visitors too -- null if they aren't a
// verified host.
export async function fetchPublicHostBadge(userId: string): Promise<PublicHostBadge | null> {
  const { data, error } = await supabase
    .from("host_profiles")
    .select("host_type, verification_status")
    .eq("user_id", userId)
    .eq("verification_status", "verified")
    .maybeSingle();
  if (error) {
    console.warn("Could not check host-verified status:", error);
    return null;
  }
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

export interface Buddy {
  id: string;
  name: string;
  cert: string;
  avatar_url: string;
  equipped_avatar_id: string | null;
}

// Mirrors renderMyBuddies(): a friendship row could have either person as
// "requester", so pick whichever side isn't us, then de-dupe by the other
// person's id -- the unique constraint on friendships only guards one
// direction, so it's possible for both A->B and B->A to exist as separate
// accepted rows for the same pair.
export async function fetchBuddiesList(userId: string): Promise<Buddy[]> {
  const { data, error } = await supabase
    .from("friendships")
    .select(
      "requester_id, addressee_id, requester:profiles!friendships_requester_id_fkey(id, name, avatar_url, cert, equipped_avatar_id), addressee:profiles!friendships_addressee_id_fkey(id, name, avatar_url, cert, equipped_avatar_id)"
    )
    .eq("status", "accepted")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);
  if (error) throw error;

  const seen = new Set<string>();
  const buddies: Buddy[] = [];
  for (const f of (data as unknown as Array<{
    requester_id: string;
    requester: Buddy | null;
    addressee: Buddy | null;
  }>) || []) {
    const other = f.requester_id === userId ? f.addressee : f.requester;
    if (other && !seen.has(other.id)) {
      seen.add(other.id);
      buddies.push(other);
    }
  }
  return buddies;
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
