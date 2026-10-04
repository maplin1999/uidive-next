"use client";

import { useEffect, useState } from "react";
import { Ticket, Gem, ShoppingBag, Trophy, UserPlus, CalendarCheck, Camera, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { useSocial } from "@/components/social/SocialContext";
import { useToast, Toast } from "@/components/Toast";
import { fetchVouchers, fetchLeaderboard, redeemCorals, Voucher, LeaderboardEntry } from "@/lib/shop";
import { AddBuddyModal } from "@/components/inbox/AddBuddyModal";
import { DiverAvatar } from "@/components/DiverAvatar";
import { CosmeticsLockerModal } from "@/components/shop/CosmeticsLockerModal";
import { ChestOpenModal } from "@/components/shop/ChestOpenModal";
import { BagIcon } from "@/components/icons/BagIcon";
import { TREASURE_CHEST_COST, ChestResult, openTreasureChest } from "@/lib/cosmetics";
import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleContext";
import type { Dictionary } from "@/lib/i18n/translations/en";

// Static per-offer styling/codePrefix/cost -- the title/desc/badge text
// itself comes from t.shop.offers.* (built in the component, where `t` is
// in scope) so each offer stays translated.
const OFFER_META = [
  { cost: 500, key: "tank" as const, badgeClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400", codePrefix: "TANK10" },
  { cost: 800, key: "nitrox" as const, badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", codePrefix: "NITROX32" },
  { cost: 1200, key: "boat" as const, badgeClass: "bg-purple-500/10 border-purple-500/20 text-purple-400", codePrefix: "BOAT25" },
];

function buildOffers(t: Dictionary) {
  return OFFER_META.map((meta) => ({
    cost: meta.cost,
    title: t.shop.offers[`${meta.key}Title`],
    desc: t.shop.offers[`${meta.key}Desc`],
    badge: t.shop.offers[`${meta.key}Badge`],
    badgeClass: meta.badgeClass,
    codePrefix: meta.codePrefix,
  }));
}

// The Dive Shop tab (#tab-diveshop in the old site): Corals balance,
// claimed vouchers, treasure chests, redeemable offers, and the leaderboard.
// Vouchers and offer redemption are fully real (see src/lib/shop.ts), and so
// are Treasure Chests/Cosmetics now (see src/lib/cosmetics.ts,
// CosmeticsLockerModal, ChestOpenModal) -- opening a chest calls the real
// open_treasure_chest() RPC, and My Dive Bag shows/equips whatever cosmetics
// that account actually owns.
export default function DiveShopPage() {
  const { user, requireAuth, refreshProfile } = useAuth();
  const { openProfile } = useSocial();
  const router = useRouter();
  const { message, showToast } = useToast();
  const { t } = useLocale();
  const offers = buildOffers(t);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardStatus, setLeaderboardStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [redeemingCost, setRedeemingCost] = useState<number | null>(null);
  const [addBuddyOpen, setAddBuddyOpen] = useState(false);
  const [lockerOpen, setLockerOpen] = useState(false);
  const [openingChest, setOpeningChest] = useState(false);
  const [chestResults, setChestResults] = useState<ChestResult[] | null>(null);

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

  async function handleRedeem(offer: ReturnType<typeof buildOffers>[number]) {
    if (!requireAuth()) return;
    if (!user) return;

    if (user.corals < offer.cost) {
      showToast(`${t.shop.notEnoughCoralsPrefix} ${offer.cost - user.corals} ${t.shop.notEnoughCoralsSuffix}`);
      return;
    }

    setRedeemingCost(offer.cost);
    try {
      const { code } = await redeemCorals(user.id, user.corals, offer.cost, offer.title, offer.codePrefix);
      await refreshProfile();
      const updated = await fetchVouchers(user.id);
      setVouchers(updated);
      showToast(`${t.shop.claimedTogglePrefix} ${offer.title}${t.shop.claimedToastMid} ${code}`);
    } catch (err) {
      console.error(err);
      showToast(t.shop.redeemError);
    } finally {
      setRedeemingCost(null);
    }
  }

  function copyCode(code: string) {
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    showToast(`${t.shop.codeCopiedPrefix} ${code} ${t.shop.codeCopiedSuffix}`);
  }

  async function handleOpenChest() {
    if (!requireAuth()) return;
    if (!user) return;
    if (user.corals < TREASURE_CHEST_COST) {
      showToast(`${t.shop.notEnoughCoralsPrefix} ${TREASURE_CHEST_COST - user.corals} ${t.shop.notEnoughCoralsSuffix}`);
      return;
    }

    setOpeningChest(true);
    try {
      const results = await openTreasureChest();
      // The cost and any duplicate refunds were applied server-side inside
      // the RPC -- re-read the real balance rather than computing a delta.
      await refreshProfile();
      setChestResults(results);
    } catch (err) {
      console.error("Could not open the chest:", err);
      showToast(t.shop.chestError);
    } finally {
      setOpeningChest(false);
    }
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
              {t.shop.coralsMarketplace}
            </span>
            <h1 className="text-2xl font-black text-white">{t.shop.title}</h1>
            <p className="text-xs text-slate-300">{t.shop.subtitle}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/40 text-center min-w-[160px] shadow-lg">
            <span className="text-2xl">🐚</span>
            <div className="text-2xl font-black text-amber-400 mt-1">{user ? user.corals : 0}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              {t.shop.availableBalance}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-xs text-slate-400">
          <span className="font-bold text-slate-300">{t.shop.waysToEarn}</span>
          <Link href="/" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <CalendarCheck className="w-3.5 h-3.5" /> {t.shop.bookTrip}
          </Link>
          <Link
            href="/community"
            className="hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5" /> {t.shop.logDiveWithPhoto}
          </Link>
          <span className="flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5" /> {t.shop.claimDailyReward}
          </span>
        </div>

        {/* VOUCHERS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" /> {t.shop.myActiveRewards}
            </h2>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {vouchers.length} {vouchers.length === 1 ? t.shop.voucherSingular : t.shop.voucherPlural}
            </span>
          </div>

          {!user && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">🎟️</div>
              <p className="text-sm font-bold text-slate-300">{t.shop.signInForVouchers}</p>
              <p className="text-xs text-slate-500">{t.shop.signInForVouchersBody}</p>
            </div>
          )}

          {user && vouchersLoading && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-500">
              {t.profile.loading}
            </div>
          )}

          {user && !vouchersLoading && vouchers.length === 0 && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">🎟️</div>
              <p className="text-sm font-bold text-slate-300">{t.shop.noVouchersTitle}</p>
              <p className="text-xs text-slate-500">{t.shop.noVouchersBody}</p>
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
                      {t.shop.activeReward}
                    </span>
                    <h4 className="text-xs sm:text-sm font-extrabold text-white">{v.title}</h4>
                    <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                      {t.shop.codeLabel} {v.code}
                    </p>
                  </div>
                  <button
                    onClick={() => copyCode(v.code)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs shrink-0 shadow-md"
                  >
                    {t.shop.copy}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TREASURE CHESTS */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-400" /> {t.shop.treasureChests}
            </h2>
            {user && (
              <button
                onClick={() => setLockerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-xl hover:bg-purple-500/20 transition-colors"
              >
                <BagIcon className="w-3.5 h-3.5 shrink-0" /> {t.header.myDiveBag}
              </button>
            )}
          </div>
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-purple-950/20 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center gap-6 shadow-lg">
            <div className="w-14 h-14 sm:w-16 sm:h-16 text-purple-400 shrink-0 flex items-center justify-center">
              <Gem className="w-full h-full" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h3 className="text-base font-extrabold text-white">{t.shop.reefChestTitle}</h3>
              <p className="text-xs text-slate-400">{t.shop.reefChestDesc}</p>
            </div>
            <button
              id="open-chest-btn"
              onClick={handleOpenChest}
              disabled={openingChest}
              className="shrink-0 py-2.5 px-5 bg-purple-500 hover:bg-purple-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              {openingChest ? (
                <span>{t.shop.opening}</span>
              ) : (
                <>
                  <span>{t.shop.openForPrefix} {TREASURE_CHEST_COST}</span>
                  <span>🐚</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* OFFERS */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" /> {t.shop.redeemableOffers}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {offers.map((offer) => (
              <div
                key={offer.title}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div className="space-y-2">
                  <div
                    className={`inline-flex items-center justify-center h-11 min-w-[2.75rem] px-3 rounded-2xl border font-black text-base whitespace-nowrap ${offer.badgeClass}`}
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
                    {redeemingCost === offer.cost ? t.shop.redeeming : `${t.shop.redeemForPrefix} ${offer.cost}`}
                  </span>
                  <span>🐚</span>
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
                <Trophy className="w-5 h-5 text-amber-400" /> {t.shop.friendsLeaderboard}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{t.shop.rankedByCorals}</p>
            </div>
            <button
              onClick={() => {
                if (!requireAuth()) return;
                setAddBuddyOpen(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{t.shop.addDiveBuddy}</span>
            </button>
          </div>

          {leaderboardStatus === "loading" && (
            <p className="text-xs text-slate-500 text-center py-8">{t.shop.loadingLeaderboard}</p>
          )}
          {leaderboardStatus === "error" && (
            <p className="text-xs text-rose-400 text-center py-8">{t.shop.leaderboardLoadError}</p>
          )}

          {leaderboardStatus === "ready" && podiumOrder.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {podiumOrder.map((entry) => {
                const rank = top3.indexOf(entry) + 1;
                const isFirst = rank === 1;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
                return (
                  <div
                    key={entry.id}
                    className={`p-5 rounded-3xl text-center space-y-3 relative shadow-lg ${
                      isFirst
                        ? "p-6 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-900 border-2 border-amber-400/60 shadow-2xl md:-translate-y-2 order-1 md:order-2"
                        : rank === 2
                          ? "bg-slate-900 border border-slate-800 order-2 md:order-1"
                          : "bg-slate-900 border border-slate-800 order-3"
                    }`}
                  >
                    <span
                      className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        isFirst
                          ? "font-black bg-amber-500 text-slate-950 border-transparent"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isFirst && user?.id === entry.id ? t.shop.youBadge : `#${rank}`}
                    </span>
                    <div className="relative inline-block">
                      <DiverAvatar
                        avatarUrl={entry.avatar_url}
                        equippedAvatarId={entry.equipped_avatar_id}
                        alt={entry.name}
                        sizeClass={isFirst ? "w-20 h-20" : "w-16 h-16"}
                        borderClass={isFirst ? "border-2 border-amber-400 shadow-lg" : "border-2 border-slate-400"}
                      />
                      <span className="absolute -bottom-1 -right-1 bg-slate-800 text-slate-200 text-xs p-1 rounded-full">
                        {medal}
                      </span>
                    </div>
                    <div>
                      <h3 className={isFirst ? "text-base font-black text-white" : "text-sm font-extrabold text-white"}>
                        {entry.name}
                        {user?.id === entry.id ? t.shop.youSuffixParen : ""}
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
                        <span className="text-[10px] text-slate-500 uppercase block">{t.profile.statsDives}</span>
                        <strong className="text-slate-200">{entry.dives}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">{t.shop.maxDepth}</span>
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
                      <span>🐚</span> <span>{Number(entry.corals).toLocaleString()}</span> <span>{t.header.corals}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {leaderboardStatus === "ready" && leaderboard.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">{t.shop.noLeaderboardYet}</p>
          )}

          {leaderboardStatus === "ready" && leaderboard.length > 0 && (
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 text-center">{t.shop.tableRank}</th>
                      <th className="py-3.5 px-4">{t.shop.tableDiver}</th>
                      <th className="py-3.5 px-4">{t.shop.tableCertification}</th>
                      <th className="py-3.5 px-4 text-center">{t.shop.tableTotalDives}</th>
                      <th className="py-3.5 px-4 text-center">{t.shop.tableDeepestDive}</th>
                      <th className="py-3.5 px-4 text-right">{t.shop.tableCoralsBalance}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {leaderboard.map((entry, i) => {
                      const isUser = user?.id === entry.id;
                      return (
                      <tr
                        key={entry.id}
                        className={isUser ? "bg-amber-500/10 font-bold border-l-4 border-amber-400" : "hover:bg-slate-800/50 transition-colors"}
                      >
                        <td className={`py-3 px-4 text-center font-black ${i + 1 === 1 ? "text-amber-400" : "text-slate-400"}`}>
                          #{i + 1}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => (isUser ? router.push("/profile") : openProfile(entry.id))}
                            className="flex items-center gap-2.5 text-left"
                          >
                            <DiverAvatar
                              avatarUrl={entry.avatar_url}
                              equippedAvatarId={entry.equipped_avatar_id}
                              cert={entry.cert}
                              alt={entry.name}
                              sizeClass="w-7 h-7"
                            />
                            <span className={`font-bold hover:underline ${isUser ? "text-amber-300" : "text-slate-100"}`}>
                              {entry.name}
                              {isUser ? t.shop.youSuffixParen : ""}
                            </span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-cyan-400 font-semibold">{entry.cert}</td>
                        <td className="py-3 px-4 text-center">{entry.dives}</td>
                        <td className="py-3 px-4 text-center text-purple-400">{entry.max_depth}</td>
                        <td className="py-3 px-4 text-right text-amber-400 font-bold">
                          🐚 {Number(entry.corals).toLocaleString()}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {addBuddyOpen && <AddBuddyModal onClose={() => setAddBuddyOpen(false)} />}
      {lockerOpen && <CosmeticsLockerModal onClose={() => setLockerOpen(false)} />}
      {chestResults && (
        <ChestOpenModal results={chestResults} onClose={() => setChestResults(null)} />
      )}
      <Toast message={message} />
    </main>
  );
}
