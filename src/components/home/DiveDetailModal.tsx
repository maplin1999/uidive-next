"use client";

import { useState } from "react";
import { X, BadgeCheck, Wind, Waves, Thermometer, Eye } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import {
  DiveTrip,
  ReviewStats,
  HostReviewStats,
  formatTripDate,
  formatRelativeTime,
  bookTrip,
} from "@/lib/trips";
import { EquipmentChecklistModal } from "@/components/home/EquipmentChecklistModal";
import { CoralsCelebration } from "@/components/CoralsCelebration";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=800&q=80";

// Migrated from the old site's #dive-modal (openDiveDetail()/confirmBooking()).
// Tapping "Confirm Booking" opens the equipment checklist first -- that
// modal's own confirm is what actually calls book_trip().
export function DiveDetailModal({
  trip,
  rating,
  hostStats,
  onClose,
  onBooked,
  onViewHost,
}: {
  trip: DiveTrip;
  rating: ReviewStats;
  hostStats: HostReviewStats | null;
  onClose: () => void;
  onBooked: () => void;
  onViewHost: (hostId: string) => void;
}) {
  const { user, requireAuth } = useAuth();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [booking, setBooking] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [error, setError] = useState("");

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
      await bookTrip(trip.id, trip.price, equipment);
      setCelebrating(true);
    } catch (err) {
      console.error("Could not complete booking:", err);
      setError(
        err instanceof Error ? err.message : "Could not complete booking -- please try again."
      );
    } finally {
      setBooking(false);
    }
  }

  if (celebrating) {
    return (
      <CoralsCelebration
        amount={50}
        title="🎉 Booking Confirmed!"
        onDone={() => {
          setCelebrating(false);
          onBooked();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950/90 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-6 space-y-4 overflow-y-auto">
          {!trip.image_url && (
            <div className="flex justify-end -mt-2 -mr-2">
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">{trip.title}</h2>
            <p className="text-sm text-slate-400">{trip.location}</p>
            {trip.host_id && trip.profiles && (
              <button
                onClick={() => onViewHost(trip.host_id!)}
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

          {trip.description && <p className="text-sm text-slate-300">{trip.description}</p>}

          <div className="grid grid-cols-2 gap-3 text-xs">
            <ConditionTile icon={<Eye className="w-3.5 h-3.5" />} label="Visibility" value={trip.visibility} />
            <ConditionTile
              icon={<Thermometer className="w-3.5 h-3.5" />}
              label="Water Temp"
              value={trip.water_temp}
            />
            <ConditionTile icon={<Waves className="w-3.5 h-3.5" />} label="Swell" value={trip.swell} />
            <ConditionTile icon={<Wind className="w-3.5 h-3.5" />} label="Wind" value={trip.wind || "—"} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <ConditionTile label="Tide" value={trip.tide || "—"} />
            <ConditionTile label="Current" value={trip.current || "—"} />
            <ConditionTile label="Level" value={trip.difficulty} />
            <ConditionTile label="Date" value={formatTripDate(trip)} />
          </div>

          {trip.conditions_updated_at && (
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Wind, swell &amp; current
              update live -- last updated {formatRelativeTime(trip.conditions_updated_at)}
            </p>
          )}

          {rating.count > 0 && (
            <p className="text-xs text-amber-400 font-bold">
              ★ {rating.avg.toFixed(1)} <span className="text-slate-500 font-semibold">({rating.count} reviews)</span>
            </p>
          )}

          {error && (
            <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-800">
            <div>
              <p className="text-2xl font-black text-cyan-400">${Number(trip.price).toLocaleString()} USD</p>
              <p className="text-[10px] text-slate-500">
                {isFull ? "Fully booked -- no spots left on this trip." : "Earn +50 🪸 Corals on booking"}
              </p>
            </div>
            <button
              onClick={handleConfirmClick}
              disabled={isFull || booking}
              className="shrink-0 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              {isFull ? "Fully Booked" : booking ? "Booking…" : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>

      {checklistOpen && (
        <EquipmentChecklistModal onClose={() => setChecklistOpen(false)} onConfirm={handleFinalize} />
      )}
    </div>
  );
}

function ConditionTile({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5">
      <p className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}
