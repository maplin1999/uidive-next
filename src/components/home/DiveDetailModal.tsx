"use client";

import { useState } from "react";
import { X, BadgeCheck, Radio, CheckCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useSocial } from "@/components/social/SocialContext";
import {
  DiveTrip,
  ReviewStats,
  HostReviewStats,
  difficultyAccent,
  formatRelativeTime,
} from "@/lib/trips";
import { startCheckout } from "@/lib/checkout";
import { EquipmentChecklistModal } from "@/components/home/EquipmentChecklistModal";
import { useEscapeClose } from "@/lib/useEscapeClose";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80";

// Migrated from the old site's #dive-modal (openDiveDetail()/confirmBooking()),
// now with real payment via Revolut instead of a free instant booking.
// Tapping "Confirm & Pay" opens the equipment checklist first -- that
// modal's own confirm is what calls startCheckout() (src/lib/checkout.ts),
// which holds the spot and redirects to Revolut's hosted checkout page.
// Whether the booking actually goes through is decided after this modal is
// long gone -- see src/app/booking/complete/page.tsx and the webhook route.
export function DiveDetailModal({
  trip,
  rating,
  hostStats,
  onClose,
}: {
  trip: DiveTrip;
  rating: ReviewStats;
  hostStats: HostReviewStats | null;
  onClose: () => void;
}) {
  const { user, requireAuth } = useAuth();
  const { openProfile } = useSocial();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  useEscapeClose(onClose);

  const spotsLeft = trip.capacity - trip.spots_booked;
  const isFull = spotsLeft <= 0;

  function handleConfirmClick() {
    if (!requireAuth()) return;
    if (isFull) return;
    setChecklistOpen(true);
  }

  async function handleFinalize(equipment: Record<string, boolean>) {
    setChecklistOpen(false);
    if (!user) return;
    setBooking(true);
    setError("");
    try {
      const { checkoutUrl } = await startCheckout(trip.id, equipment);
      // Full navigation, not a client-side route change -- checkoutUrl is a
      // Revolut-hosted page on a different domain entirely. onBooked() is
      // deliberately not called here: nothing about this trip is actually
      // booked yet, only held, until the diver pays on Revolut's page and
      // the webhook confirms it (see /booking/complete).
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Could not start checkout:", err);
      setError(err instanceof Error ? err.message : "Could not start checkout -- please try again.");
      setBooking(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {trip.image_url && (
          <div className="relative h-44 shrink-0 bg-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={trip.image_url || FALLBACK_IMG}
              alt={trip.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_IMG;
              }}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1">
              <span
                className={`${difficultyAccent(trip.difficulty).tag} border text-[10px] px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap`}
              >
                {difficultyAccent(trip.difficulty).label}
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{trip.title}</h2>
              <p className="text-xs text-slate-400">{trip.location}</p>
              {trip.host_id && trip.profiles && (
                <button
                  onClick={() => openProfile(trip.host_id!)}
                  className="text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Hosted by <span className="font-bold text-slate-200">{trip.profiles.name}</span>
                  {hostStats && hostStats.review_count > 0 && (
                    <>
                      <span className="text-amber-400">★ {Number(hostStats.avg_rating).toFixed(1)}</span>
                      <span className="text-slate-500">({hostStats.review_count})</span>
                    </>
                  )}
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {trip.description && (
            <p className="text-xs text-slate-400 leading-relaxed">{trip.description}</p>
          )}

          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Visibility</p>
              <p className="text-base font-extrabold text-cyan-400 mt-0.5">{trip.visibility}</p>
            </div>
            <div className="border-x border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Water Temp</p>
              <p className="text-base font-extrabold text-emerald-400 mt-0.5">{trip.water_temp}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Swell</p>
              <p className="text-base font-extrabold truncate text-indigo-400 mt-0.5">{trip.swell}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Wind</p>
              <p className="text-base font-extrabold truncate text-sky-400 mt-0.5">{trip.wind || "—"}</p>
            </div>
            <div className="border-x border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Tide</p>
              <p className="text-base font-extrabold truncate text-teal-400 mt-0.5">{trip.tide || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Current</p>
              <p className="text-base font-extrabold truncate text-orange-400 mt-0.5">
                {trip.current || "—"}
              </p>
            </div>
          </div>

          {trip.conditions_updated_at && (
            <p className="text-[9px] text-slate-500 -mt-2 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-400" /> Wind, Swell &amp; Current update live ·
              updated {formatRelativeTime(trip.conditions_updated_at)}
            </p>
          )}

          {rating.count > 0 && (
            <p className="text-xs text-amber-400 font-bold">
              ★ {rating.avg.toFixed(1)}{" "}
              <span className="text-slate-500 font-semibold">({rating.count} reviews)</span>
            </p>
          )}

          {error && (
            <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <div
            className={`bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between transition-opacity ${
              isFull ? "opacity-50 grayscale" : ""
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🪸</span>
              <div>
                <p className="text-sm font-bold text-amber-400">
                  {isFull ? "Trip full -- no rewards available" : "Earn +50 Corals"}
                </p>
                <p className="text-xs text-slate-400">
                  {isFull ? "Fully booked -- no spots left on this trip." : "Added automatically upon dive log completion"}
                </p>
              </div>
            </div>
            <span className="text-lg font-black text-white shrink-0">
              £{Number(trip.price).toLocaleString()} GBP
            </span>
          </div>

          <button
            onClick={handleConfirmClick}
            disabled={isFull || booking}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <span>{isFull ? "Fully Booked" : booking ? "Taking you to checkout…" : "Confirm & Pay"}</span>
            {!isFull && <CheckCircle className="w-4 h-4" />}
          </button>
          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 shrink-0" />
            Secure payment via Revolut -- your spot is held while you pay.
          </p>
        </div>
      </div>

      {checklistOpen && (
        <EquipmentChecklistModal onClose={() => setChecklistOpen(false)} onConfirm={handleFinalize} />
      )}
    </div>
  );
}
