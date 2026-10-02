import { supabase } from "@/lib/supabase";

// Ocean Conservation pledge pool -- see add-conservation-pledges.sql for the
// full reasoning. The monthly goal is a plain constant (same pattern as
// TREASURE_CHEST_COST in lib/cosmetics.ts) rather than something stored in
// the DB: it's a product/marketing number, not user data, and tuning it
// shouldn't need a migration. Update this once the real revenue-share % and
// partner charity are locked in -- it's a placeholder for launch.
export const CONSERVATION_MONTHLY_GOAL_CORALS = 5000;

// Preset amounts shown as quick-pick buttons in the pledge UI, scaled to
// sit comfortably under the smallest Dive Shop offer (500 Corals) since
// this is meant to be an easy, repeatable "give a little" action rather
// than a big single redemption.
export const CONSERVATION_PLEDGE_PRESETS = [25, 50, 100];

export interface ConservationStats {
  monthTotal: number;
  allTimeTotal: number;
}

export async function fetchConservationStats(): Promise<ConservationStats> {
  const { data, error } = await supabase
    .from("conservation_fund_stats")
    .select("month_total, all_time_total")
    .maybeSingle();

  if (error) throw error;
  return {
    monthTotal: data?.month_total ?? 0,
    allTimeTotal: data?.all_time_total ?? 0,
  };
}

// Debits the caller's own Corals balance and records the pledge, all
// atomically server-side -- see pledge_corals_to_conservation() in
// add-conservation-pledges.sql. Callers should follow this with
// refreshProfile() (from useAuth) the same way every other Corals spend
// does (redeemCorals, openTreasureChest), since this RPC doesn't update
// the client-side user object itself.
export async function pledgeCoralsToConservation(amount: number): Promise<void> {
  const { error } = await supabase.rpc("pledge_corals_to_conservation", { p_amount: amount });
  if (error) throw error;
}
