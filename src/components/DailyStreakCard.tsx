"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { CoralsCelebration } from "@/components/CoralsCelebration";
import { claimDailyReward, alreadyClaimedDailyToday } from "@/lib/shop";

// Daily Corals claim -- moved here from the Explore page so it lives with
// the rest of a diver's own stats/rewards on their Profile instead of the
// public landing page. Self-contained (own useAuth + claim state) so it can
// be dropped into any page with just a toast callback, same pattern as
// ConservationBanner.
export function DailyStreakCard({ onToast }: { onToast: (message: string) => void }) {
  const { user, requireAuth, refreshProfile } = useAuth();
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const alreadyClaimedToday = !!user && alreadyClaimedDailyToday(user.last_daily_claim);

  async function handleClaimDaily() {
    if (!requireAuth()) return;
    if (alreadyClaimedToday) return;

    setClaimingDaily(true);
    try {
      await claimDailyReward();
      await refreshProfile();
      setCelebrating(true);
    } catch (err) {
      console.error("Could not claim daily reward:", err);
      onToast("❌ Could not claim your daily reward -- please try again.");
      await refreshProfile(); // in case it actually succeeded server-side already today
    } finally {
      setClaimingDaily(false);
    }
  }

  return (
    <>
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-2xl shrink-0">
            🪸
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="text-sm font-bold text-amber-400">Daily Diver Log Streak</h3>
              <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                5 Days Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Book or log a dive today to earn +50 🪸 Corals rewards!
            </p>
          </div>
        </div>
        <button
          onClick={handleClaimDaily}
          disabled={alreadyClaimedToday || claimingDaily}
          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shrink-0 flex items-center justify-center space-x-1 shadow-lg"
        >
          <span>
            {alreadyClaimedToday
              ? "Claimed for Today ✓"
              : claimingDaily
                ? "Claiming…"
                : "Claim 50 Corals"}
          </span>
          {!alreadyClaimedToday && <span>🪸</span>}
        </button>
      </div>

      {celebrating && (
        <CoralsCelebration amount={50} title="🎉 Daily Streak Claimed!" onDone={() => setCelebrating(false)} />
      )}
    </>
  );
}
