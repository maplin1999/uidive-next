import { supabase } from "@/lib/supabase";
import { DEFAULT_AVATAR } from "@/lib/auth-types";

export interface Voucher {
  title: string;
  code: string;
  redeemed_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  cert: string;
  dives: number;
  max_depth: string;
  corals: number;
  avatar_url: string;
}

export async function fetchVouchers(userId: string): Promise<Voucher[]> {
  const { data, error } = await supabase
    .from("vouchers")
    .select("title, code, redeemed_at")
    .eq("user_id", userId)
    .order("redeemed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Despite the "Friends" name in the UI (carried over from the old site --
// see renderLeaderboard() in app.js), this was never actually scoped to
// buddies/friends there either: it's a straight top-50-by-Corals ranking
// across every profile, publicly readable. A real buddy-scoped version is
// future work once the buddy system (Inbox) is migrated.
export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, cert, dives, max_depth, corals, avatar_url")
    .order("corals", { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data || []).map((p) => ({ ...p, avatar_url: p.avatar_url || DEFAULT_AVATAR }));
}

// Mirrors redeemCorals() in the old app.js: two sequential writes (debit the
// balance, then insert the voucher) rather than one atomic RPC. Same
// trade-off the old site made -- a crash between the two steps could in
// theory debit Corals without granting the voucher. Worth a real
// SECURITY DEFINER function (like book_trip()) later; out of scope for this
// pass, which is about parity first.
export async function redeemCorals(
  userId: string,
  currentBalance: number,
  cost: number,
  rewardTitle: string,
  codePrefix: string
): Promise<{ code: string; newBalance: number }> {
  if (currentBalance < cost) {
    throw new Error(`Not enough Corals! Need ${cost - currentBalance} more.`);
  }

  const newBalance = currentBalance - cost;
  const code = `${codePrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { error: balanceError } = await supabase
    .from("profiles")
    .update({ corals: newBalance })
    .eq("id", userId);
  if (balanceError) throw balanceError;

  const { error: voucherError } = await supabase
    .from("vouchers")
    .insert({ user_id: userId, title: rewardTitle, code, cost });
  if (voucherError) throw voucherError;

  return { code, newBalance };
}
