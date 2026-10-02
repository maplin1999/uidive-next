"use client";

import { useEffect, useState } from "react";
import { X, Star, Pencil, BadgeCheck, Users, MessageSquare, Backpack, Radio, XCircle, Anchor } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useSocial } from "@/components/social/SocialContext";
import { EQUIPMENT_ITEMS, formatRelativeTime } from "@/lib/trips";
import {
  MyBooking,
  getBookingReview,
  tripHasPassed,
  cancelBooking,
  submitTripReview,
} from "@/lib/profile";
import { RosterDiver, fetchTripRoster } from "@/lib/host";
import { supabase } from "@/lib/supabase";
import { TripChatModal } from "@/components/inbox/TripChatModal";
import { DiverAvatar } from "@/components/DiverAvatar";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DiveLog, fetchDiveLogByBooking } from "@/lib/dive-log";
import { DiveLogFormModal } from "@/components/profile/DiveLogFormModal";
import { DiveLogDetailModal } from "@/components/profile/DiveLogDetailModal";

// Migrated from the old site's #booking-detail-modal: full trip conditions,
// equipment noted at booking time, fellow-diver roster, the trip's group
// chat, cancelling, and leaving/editing a star review once the dive has
// actually happened.
export function BookingDetailModal({
  booking,
  onClose,
  onChanged,
}: {
  booking: MyBooking;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { user, requireAuth } = useAuth();
  const { openProfile } = useSocial();
  const trip = booking.dive_trips;
  const isConfirmed = booking.status === "confirmed";
  const hasPassed = tripHasPassed(trip);
  const existingReview = getBookingReview(booking);

  const [roster, setRoster] = useState<RosterDiver[]>([]);
  const [rosterStatus, setRosterStatus] = useState<"loading" | "ready" | "error">("loading");
  const [hostStats, setHostStats] = useState<{ avg_rating: number; review_count: number } | null>(
    null
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Completed-trip "Add to Dive Log" -- null while checking, a DiveLog once
  // this booking already has one (swaps the button to "View in Dive Log"),
  // or undefined-ish (kept as null) if it never got one.
  const [bookingDiveLog, setBookingDiveLog] = useState<DiveLog | null>(null);
  const [diveLogFormOpen, setDiveLogFormOpen] = useState(false);
  const [diveLogDetailOpen, setDiveLogDetailOpen] = useState(false);

  const [editingReview, setEditingReview] = useState(!existingReview);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");

  useEscapeClose(onClose);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (!booking.trip_id) return;
    fetchTripRoster(booking.trip_id)
      .then(setRoster)
      .then(() => setRosterStatus("ready"))
      .catch((err) => {
        console.error("Could not load roster:", err);
        setRosterStatus("error");
      });
  }, [booking.trip_id]);

  useEffect(() => {
    if (!trip?.host_id) return;
    supabase
      .from("host_review_stats")
      .select("avg_rating, review_count")
      .eq("host_id", trip.host_id)
      .maybeSingle()
      .then(({ data }) => setHostStats(data));
  }, [trip?.host_id]);

  useEffect(() => {
    if (!(isConfirmed && hasPassed)) return;
    fetchDiveLogByBooking(booking.id)
      .then(setBookingDiveLog)
      .catch((err) => console.error("Could not check your dive log for this booking:", err));
  }, [booking.id, isConfirmed, hasPassed]);

  const dateStr = trip?.scheduled_date
    ? new Date(trip.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const whenStr = [dateStr, trip?.scheduled_time].filter(Boolean).join(" • ") || "Date TBC";

  const statusBadge =
    booking.status === "refunded" ? (
      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
        Refunded
      </span>
    ) : booking.status === "cancelled" ? (
      <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-0.5 rounded-full">
        Cancelled
      </span>
    ) : isConfirmed && hasPassed ? (
      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
        Completed
      </span>
    ) : (
      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
        Confirmed
      </span>
    );

  const ownedEquipment = EQUIPMENT_ITEMS.filter((item) => booking.equipment && booking.equipment[item.id]);

  async function handleCancel() {
    setCancelling(true);
    try {
      await cancelBooking(booking.id);
      onChanged();
      onClose();
    } catch (err) {
      console.error("Could not cancel booking:", err);
      setCancelling(false);
      setConfirmCancelOpen(false);
    }
  }

  async function handleSubmitReview() {
    if (!rating) {
      setReviewError("Tap a star to choose a rating first.");
      return;
    }
    setReviewError("");
    setSubmittingReview(true);
    try {
      await submitTripReview(booking.id, rating, comment.trim());
      setEditingReview(false);
      onChanged();
    } catch (err) {
      console.error("Could not save review:", err);
      setReviewError(
        err instanceof Error ? err.message : "Could not save your review -- please try again."
      );
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <div className="min-w-0">
            <div className="mb-1">{statusBadge}</div>
            <h2 className="text-2xl font-black text-white truncate">{trip?.title || "Dive trip"}</h2>
            <p className="text-xs text-slate-400">{trip?.location}</p>
            {trip?.host_id && trip.profiles && (
              <button
                onClick={() => openProfile(trip.host_id!)}
                className="mt-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1.5"
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
            <p className="text-xs text-cyan-400 font-semibold mt-0.5">{whenStr}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-3 rounded-full bg-slate-800 text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {trip && (
          <>
            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Visibility</p>
                <p className="text-base font-extrabold text-cyan-400 mt-0.5">{trip.visibility || "—"}</p>
              </div>
              <div className="border-x border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Water Temp</p>
                <p className="text-base font-extrabold text-emerald-400 mt-0.5">{trip.water_temp || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Swell</p>
                <p className="text-base font-extrabold truncate text-indigo-400 mt-0.5">{trip.swell || "—"}</p>
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
                <p className="text-base font-extrabold truncate text-orange-400 mt-0.5">{trip.current || "—"}</p>
              </div>
            </div>
            {trip.conditions_updated_at && (
              <p className="text-[9px] text-slate-500 -mt-2 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400" /> Wind, Swell &amp; Current update live ·
                updated {formatRelativeTime(trip.conditions_updated_at)}
              </p>
            )}
          </>
        )}

        <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Amount Paid</p>
          <span className="text-lg font-black text-white">${Number(booking.price_paid)}</span>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Backpack className="w-3.5 h-3.5" /> Bringing Your Own
          </h3>
          {ownedEquipment.length === 0 ? (
            <p className="text-xs text-slate-500">No equipment noted for this booking.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {ownedEquipment.map((item) => (
                <span
                  key={item.id}
                  className="text-[10px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-1 rounded-full"
                >
                  {item.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Fellow Divers
          </h3>
          {rosterStatus === "loading" && <p className="text-xs text-slate-500">Loading fellow divers…</p>}
          {rosterStatus === "error" && (
            <p className="text-xs text-slate-500">Fellow divers aren&apos;t available right now.</p>
          )}
          {rosterStatus === "ready" && roster.length === 0 && (
            <p className="text-xs text-slate-500">No fellow divers booked yet.</p>
          )}
          {rosterStatus === "ready" && roster.length > 0 && (
            <div className="space-y-1.5">
              {roster.map((d) => (
                <div
                  key={d.diver_user_id}
                  className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2"
                >
                  <DiverAvatar
                    avatarUrl={d.diver_avatar_url}
                    equippedAvatarId={d.equipped_avatar_id}
                    cert={d.diver_cert}
                    sizeClass="w-8 h-8"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {d.diver_name || "Diver"}
                      {d.is_you && <span className="text-slate-500 font-semibold"> (You)</span>}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{d.diver_cert || ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isConfirmed && hasPassed && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" /> {existingReview && !editingReview ? "Your Review" : "Rate This Dive"}
            </h3>
            {existingReview && !editingReview ? (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i <= existingReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                      }`}
                    />
                  ))}
                </div>
                {existingReview.comment && (
                  <p className="text-xs text-slate-300">{existingReview.comment}</p>
                )}
                <button
                  onClick={() => setEditingReview(true)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded-full transition-colors"
                >
                  <Pencil className="w-3 h-3" /> Edit Review
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                {reviewError && (
                  <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                    {reviewError}
                  </p>
                )}
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button key={i} type="button" onClick={() => setRating(i)} className="p-0.5">
                      <Star
                        className={`w-6 h-6 ${
                          i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  maxLength={300}
                  placeholder="How was the dive? (optional)"
                  className="bg-slate-900 w-full px-3 py-2 rounded-xl border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  {submittingReview ? "Saving…" : existingReview ? "Save Review" : "Submit Review"}
                </button>
              </div>
            )}

            <button
              onClick={() => {
                if (!requireAuth()) return;
                if (bookingDiveLog) {
                  setDiveLogDetailOpen(true);
                } else {
                  setDiveLogFormOpen(true);
                }
              }}
              className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Anchor className="w-3.5 h-3.5 text-cyan-400" />
              {bookingDiveLog ? "View in Dive Log" : "Add to Dive Log"}
            </button>
          </div>
        )}

        {isConfirmed && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                if (!requireAuth()) return;
                setChatOpen(true);
              }}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open Group Chat</span>
            </button>
            <button
              onClick={() => setConfirmCancelOpen(true)}
              disabled={cancelling}
              className="w-full py-3 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <XCircle className="w-4 h-4" />
              <span>{cancelling ? "Cancelling…" : "Cancel Booking"}</span>
            </button>
          </div>
        )}
      </div>

      {chatOpen && trip && (
        <TripChatModal tripId={booking.trip_id} tripTitle={trip.title} onClose={() => setChatOpen(false)} />
      )}
      {confirmCancelOpen && (
        <ConfirmModal
          title="Cancel this booking?"
          message="Your spot will be released back to other divers. This can't be undone."
          confirmLabel="Cancel Booking"
          cancelLabel="Keep Booking"
          confirming={cancelling}
          onConfirm={handleCancel}
          onCancel={() => setConfirmCancelOpen(false)}
        />
      )}
      {diveLogFormOpen && user && trip && (
        <DiveLogFormModal
          userId={user.id}
          diveLog={bookingDiveLog}
          prefill={
            bookingDiveLog
              ? null
              : {
                  dive_date: trip.scheduled_date || "",
                  location: trip.location,
                  dive_site: trip.title,
                  booking_id: booking.id,
                }
          }
          onClose={() => setDiveLogFormOpen(false)}
          onSaved={(log) => {
            setBookingDiveLog(log);
            setDiveLogFormOpen(false);
          }}
        />
      )}
      {diveLogDetailOpen && bookingDiveLog && (
        <DiveLogDetailModal
          diveLog={bookingDiveLog}
          onClose={() => setDiveLogDetailOpen(false)}
          onEdit={() => {
            setDiveLogDetailOpen(false);
            setDiveLogFormOpen(true);
          }}
          onDelete={() => {
            // Deleting from here would desync bookingDiveLog with no easy
            // undo path from a booking's own modal -- deleting a logged
            // dive stays a Dive Log action, done from the logbook itself.
            setDiveLogDetailOpen(false);
          }}
        />
      )}
    </div>
  );
}
