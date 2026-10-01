"use client";

import { useEffect, useState } from "react";
import { Ticket, Gem, ShoppingBag, Trophy, UserPlus, CalendarCheck, Camera, Gift } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast, Toast } from "@/components/Toast";
import { fetchVouchers, fetchLeaderboard, redeemCorals, Voucher, LeaderboardEntry } from "@/lib/shop";
import { diverCertRingClass } from "@/lib/diverRing";
import Link from "next/link";

const OFFERS = [
  {
    cost: 500,
    title: "$10 Tank Rental Voucher",
    desc: "Redeem for $10 off your next scuba cylinder refill or hire at any partner dive shop.",
    badge: "-$10",
    badgeClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    codePrefix: "TANK10",
  },
  {
    cost: 800,
    title: "Nitrox Air Upgrade",
    desc: "Get a free Enriched Air Nitrox 32% fill upgrade on any booked boat charter trip.",
    badge: "FREE",
    badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    codePrefix: "NITROX32",
  },
  {
    cost: 1200,
    title: "25% Off Boat Charters",
    desc: "Save 25% on premium boat dive charters including Magic Point and offshore reefs.",
    badge: "25%",
    badgeClass: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    codePrefix: "BOAT25",
  },
];

// The Dive Shop tab (#tab-diveshop in the old site): Corals balance,
// claimed vouchers, treasure chests, redeemable offers, and the leaderboard.
// Vouchers and offer redemption are fully real (see src/lib/shop.ts) now
// that auth exists. Treasure Chests are stubbed -- that's a whole cosmetics
// subsystem (avatar rings, calling cards, the chest-opening animation) on
// its own, out of scope for this pass.
export default function DiveShopPage() {
  const { user, requireAuth, refreshProfile } = useAuth();
  const { message, showToast } = useToast();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [redeemingCost, setRedeemingCost] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setVouchers([]);
      setVouchersLoading(false);
      return;
    }
    setVouchersLoading(true);
    fetchVouchers(user.id)
      .then(setVouchers)
      .catch((err) => console.error("Could not load vouchers:", err))
      .finally(() => setVouchersLoading(false));
  }, [user]);

  useEffect(() => {
    fetchLeaderboard()
      .then((data) => {
        setLeaderboard(data);
        setLeaderboardStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load leaderboard:", err);
        setLeaderboardStatus("error");
      });
  }, []);

  async function handleRedeem(offer: (typeof OFFERS)[number]) {
    if (!requireAuth()) return;
    if (!user) return;

    if (user.corals < offer.cost) {
      showToast(`❌ Not enough 🪸 Corals! Need ${offer.cost - user.corals} more.`);
      return;
    }

    setRedeemingCost(offer.cost);
    try {
      const { code } = await redeemCorals(user.id, user.corals, offer.cost, offer.title, offer.codePrefix);
      await refreshProfile();
      const updated = await fetchVouchers(user.id);
      setVouchers(updated);
      showToast(`🎁 Claimed ${offer.title}! Code: ${code}`);
    } catch (err) {
      console.error(err);
      showToast("❌ Something went wrong redeeming that -- please try again.");
    } finally {
      setRedeemingCost(null);
    }
  }

  function copyCode(code: string) {
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    showToast(`Code ${code} copied to clipboard!`);
  }

  const top3 = leaderboard.slice(0, 3);
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* HERO */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
              🪸 Corals Marketplace
            </span>
            <h1 className="text-2xl font-black text-white">The Dive Shop &amp; Rewards</h1>
            <p className="text-xs text-slate-300">
              Spend your hard-earned Corals or view your active reward vouchers.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 text-center min-w-[160px] shadow-lg">
            <span className="text-2xl">🪸</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{user ? user.corals : 0}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Available Balance
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-slate-400">
          <span className="font-bold text-slate-300">Ways to earn Corals:</span>
          <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" /> Book a dive trip (+50)
          </Link>
          <Link
            href="/community"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" /> Log a dive with a photo (+10)
          </Link>
          <span className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" /> Claim your daily reward
          </span>
        </div>

        {/* VOUCHERS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" /> My Active Claimed Rewards
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {vouchers.length} Voucher{vouchers.length === 1 ? "" : "s"}
            </span>
          </div>

          {!user && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">🎟️</div>
              <p className="text-sm font-bold text-slate-300">Sign in to see your vouchers</p>
              <p className="text-xs text-slate-500">
                Your claimed rewards are tied to your account.
              </p>
            </div>
          )}

          {user && vouchersLoading && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
              Loading…
            </div>
          )}

          {user && !vouchersLoading && vouchers.length === 0 && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">🎟️</div>
              <p className="text-sm font-bold text-slate-300">No active vouchers yet</p>
              <p className="text-xs text-slate-500">
                Redeem any reward offer below using your Corals balance to save it here.
              </p>
            </div>
          )}

          {user && !vouchersLoading && vouchers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vouchers.map((v) => (
                <div
                  key={v.code}
                  className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between gap-4 shadow-xl"
                >
                  <div className="space-y-1">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ACTIVE REWARD
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white">{v.title}</h4>
                    <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                      CODE: {v.code}
                    </p>
                  </div>
                  <button
                    onClick={() => copyCode(v.code)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs shrink-0 shadow-md"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TREASURE CHESTS (stub) */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-400" /> Treasure Chests
            </h2>
            {user && (
              <button
                onClick={() => showToast("Your Locker is coming in a future update.")}
                className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl hover:bg-purple-500/20 transition-colors"
              >
                My Locker
              </button>
            )}
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center gap-6 shadow-lg">
            <div className="w-14 h-14 sm:w-16 sm:h-16 text-purple-400 shrink-0 flex items-center justify-center">
              <Gem className="w-full h-full" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="text-base font-extrabold text-white">Reef Chest</h3>
              <p className="text-xs text-slate-400">
                Open for 3 random cosmetic rewards — Avatars &amp; Calling Cards, in Common, Rare
                &amp; Epic tiers, to equip on your profile. Already own one? You&apos;ll get
                Corals back instead.
              </p>
            </div>
            <button
              onClick={() => {
                if (!requireAuth()) return;
                showToast("Opening Treasure Chests is coming in a future update.");
              }}
              className="shrink-0 py-2.5 px-5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>Open for 150</span>
              <span>🪸</span>
            </button>
          </div>
        </div>

        {/* OFFERS */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" /> Redeemable Coral Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {OFFERS.map((offer) => (
              <div
                key={offer.title}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-2">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-black text-lg ${offer.badgeClass}`}
                  >
                    {offer.badge}
                  </div>
                  <h3 className="text-base font-extrabold text-white">{offer.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{offer.desc}</p>
                </div>
                <button
                  onClick={() => handleRedeem(offer)}
                  disabled={redeemingCost === offer.cost}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 shadow-md"
                >
                  <span>
                    {redeemingCost === offer.cost ? "Redeeming…" : `Redeem for ${offer.cost}`}
                  </span>
                  <span>🪸</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* LEADERBOARD */}
        <div className="space-y-6 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" /> Dive Leaderboard
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Ranked by total Corals balance</p>
            </div>
            <button
              onClick={() => {
                if (!requireAuth()) return;
                showToast("Adding dive buddies is coming in a future update.");
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Dive Buddy</span>
            </button>
          </div>

          {leaderboardStatus === "loading" && (
            <p className="text-xs text-slate-500 text-center py-8">Loading leaderboard…</p>
          )}
          {leaderboardStatus === "error" && (
            <p className="text-xs text-rose-400 text-center py-8">
              Could not load the leaderboard -- please refresh.
            </p>
          )}

          {leaderboardStatus === "ready" && podiumOrder.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {podiumOrder.map((entry, i) => {
                const rank = top3.indexOf(entry) + 1;
                const isFirst = rank === 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
                return (
                  <div
                    key={entry.id}
                    className={`p-5 rounded-3xl text-center space-y-3 relative shadow-lg ${
                      isFirst
                        ? "p-6 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-400/60 shadow-2xl md:-translate-y-2 order-1 md:order-none"
                        : "bg-slate-900 border border-slate-800"
                    }`}
                    style={!isFirst ? { order: i === 0 ? 2 : 3 } : undefined}
                  >
                    <span
                      className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isFirst
                          ? "font-black bg-amber-500 text-slate-950 border-transparent"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isFirst && user?.id === entry.id ? "You" : `#${rank}`}
                    </span>
                    <div className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={entry.avatar_url}
                        alt={entry.name}
                        className={`object-cover mx-auto border-2 rounded-full ${
                          isFirst ? "w-20 h-20 border-amber-400 shadow-lg" : "w-16 h-16 border-slate-400"
                        }`}
                      />
                      <span className="absolute -bottom-1 -right-1 bg-slate-800 text-slate-200 text-xs p-1 rounded-full">
                        {medal}
                      </span>
                    </div>
                    <div>
                      <h3 className={isFirst ? "text-base font-black text-white" : "text-sm font-extrabold text-white"}>
                        {entry.name}
                        {user?.id === entry.id ? " (You)" : ""}
                      </h3>
                      <p className={isFirst ? "text-xs text-amber-400 font-bold" : "text-[11px] text-cyan-400 font-semibold"}>
                        {entry.cert}
                      </p>
                    </div>
                    <div
                      className={`grid grid-cols-2 gap-2 p-2.5 rounded-xl border text-center text-xs ${
                        isFirst ? "bg-slate-950 border-slate-800" : "panel-sunken bg-slate-950/80 border-slate-800/80"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Dives</span>
                        <strong className="text-slate-200">{entry.dives}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Max Depth</span>
                        <strong className="text-purple-400">{entry.max_depth}</strong>
                      </div>
                    </div>
                    <div
                      className={`text-xs rounded-xl border flex items-center justify-center gap-1 ${
                        isFirst
                          ? "font-black text-amber-400 bg-amber-500/20 border-amber-500/30 py-2"
                          : "font-bold text-amber-400 bg-amber-500/10 border-amber-500/20 py-1.5"
                      }`}
                    >
                      <span>🪸</span> <span>{entry.corals}</span> <span>Corals</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {leaderboardStatus === "ready" && leaderboard.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No divers on the leaderboard yet.</p>
          )}

          {leaderboardStatus === "ready" && leaderboard.length > 0 && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Diver</th>
                      <th className="py-3.5 px-4">Certification</th>
                      <th className="py-3.5 px-4 text-center">Total Dives</th>
                      <th className="py-3.5 px-4 text-center">Deepest Dive</th>
                      <th className="py-3.5 px-4 text-right">Corals Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {leaderboard.map((entry, i) => (
                      <tr
                        key={entry.id}
                        className={user?.id === entry.id ? "bg-cyan-500/5" : ""}
                      >
                        <td className="py-3 px-4 text-center font-bold text-slate-400">{i + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={entry.avatar_url}
                              alt={entry.name}
                              className={`w-7 h-7 rounded-full object-cover border-2 ${diverCertRingClass(entry.cert)}`}
                            />
                            <span className="font-bold text-slate-100">
                              {entry.name}
                              {user?.id === entry.id ? " (You)" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{entry.cert}</td>
                        <td className="py-3 px-4 text-center">{entry.dives}</td>
                        <td className="py-3 px-4 text-center text-purple-400">{entry.max_depth}</td>
                        <td className="py-3 px-4 text-right text-amber-400 font-bold">
                          🪸 {entry.corals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message={message} />
    </main>
  );
}
