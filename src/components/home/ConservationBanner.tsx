"use client";

import { useEffect, useState } from "react";
import { Waves } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { DiverIcon } from "@/components/icons/DiverIcon";
import { DiveBoatIcon } from "@/components/icons/DiveBoatIcon";
import {
  CONSERVATION_MONTHLY_GOAL_CORALS,
  CONSERVATION_PLEDGE_PRESETS,
  fetchConservationStats,
  pledgeCoralsToConservation,
} from "@/lib/conservation";
import { useLocale } from "@/components/i18n/LocaleContext";

// New (not migrated -- the old site had nothing like this): a standing
// banner on the Explore page showing a share of UiDive's own booking
// revenue goes to real ocean conservation work, with a diver-swims-to-boat
// progress bar toward this month's pledge goal. Public (no sign-in needed
// to see the progress), same "the count is public, pledging is personal"
// split as the Dive Log/leaderboard stats elsewhere. Partner charity is
// deliberately not named yet -- see add-conservation-pledges.sql.
export function ConservationBanner({ onToast }: { onToast: (message: string) => void }) {
  const { t } = useLocale();
  const { user, requireAuth, refreshProfile } = useAuth();
  const [monthTotal, setMonthTotal] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [pledgeOpen, setPledgeOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [pledging, setPledging] = useState(false);

  function loadStats() {
    fetchConservationStats()
      .then((stats) => {
        setMonthTotal(stats.monthTotal);
        setStatsLoaded(true);
      })
      .catch((err) => console.error("Could not load conservation stats:", err));
  }

  useEffect(() => {
    loadStats();
  }, []);

  const progressPct = Math.min(100, (monthTotal / CONSERVATION_MONTHLY_GOAL_CORALS) * 100);

  async function handlePledge(amount: number) {
    if (!requireAuth()) return;
    if (!user) return;
    if (amount <= 0) return;
    if (amount > user.corals) {
      onToast(`${t.conservationBanner.notEnoughCoralsPrefix} ${user.corals}.`);
      return;
    }

    setPledging(true);
    try {
      await pledgeCoralsToConservation(amount);
      await refreshProfile();
      loadStats();
      setPledgeOpen(false);
      setCustomAmount("");
      onToast(`${t.conservationBanner.pledgedTogglePrefix} ${amount} ${t.conservationBanner.pledgedToggleSuffix}`);
    } catch (err) {
      console.error("Could not pledge Corals:", err);
      onToast(t.conservationBanner.pledgeError);
    } finally {
      setPledging(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Waves className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-bold text-white">{t.conservationBanner.heading}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.conservationBanner.description}
          </p>
        </div>
      </div>

      {/* PROGRESS: diver swims toward the boat as the month's pledges add up */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-cyan-300">
            {statsLoaded ? monthTotal.toLocaleString() : "…"} / {CONSERVATION_MONTHLY_GOAL_CORALS.toLocaleString()}{" "}
            {t.conservationBanner.coralsPledgedSuffix}
          </span>
          <span className="text-slate-500">{Math.round(progressPct)}%</span>
        </div>
        <div className="flex items-center gap-2 pt-2 pb-1">
          <div className="relative flex-1 h-2 rounded-full bg-slate-800 overflow-visible">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
            <div
              className="diver-bob absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out text-cyan-300"
              style={{ left: `calc(${progressPct}% - 10px)` }}
            >
              <DiverIcon className="w-6 h-6 drop-shadow" />
            </div>
          </div>
          <DiveBoatIcon className="w-6 h-6 text-emerald-400 shrink-0" />
        </div>
      </div>

      {!pledgeOpen ? (
        <button
          type="button"
          onClick={() => (requireAuth() ? setPledgeOpen(true) : undefined)}
          className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-lg flex items-center justify-center gap-1.5"
        >
          <span> </span> <span>{t.conservationBanner.pledgeCorals}</span>
        </button>
      ) : (
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center flex-wrap gap-2">
            {CONSERVATION_PLEDGE_PRESETS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePledge(amount)}
                disabled={pledging}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-cyan-500/40 disabled:opacity-50 transition-colors"
              >
                  {amount}
              </button>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min={1}
                placeholder={t.conservationBanner.customPlaceholder}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="button"
                onClick={() => handlePledge(Math.floor(Number(customAmount)))}
                disabled={pledging || !customAmount || Number(customAmount) <= 0}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 transition-colors"
              >
                {pledging ? "…" : t.conservationBanner.pledge}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">
              {t.conservationBanner.yourBalance} <span className="text-amber-400 font-bold">{user ? user.corals : 0}</span>  
            </p>
            <button
              type="button"
              onClick={() => {
                setPledgeOpen(false);
                setCustomAmount("");
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-300 transition-colors"
            >
              {t.conservationBanner.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
