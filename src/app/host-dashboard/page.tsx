"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Anchor,
  CalendarDays,
  DollarSign,
  Gauge,
  Star,
  List,
  Users,
  Plus,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast, Toast } from "@/components/Toast";
import {
  HostStatus,
  HostTrip,
  HostBookingRow,
  HostReviewStats,
  fetchHostStatus,
  fetchHostDashboard,
  cancelTrip,
} from "@/lib/host";
import { HostApplicationForm } from "@/components/host/HostApplicationForm";
import { TripFormModal } from "@/components/host/TripFormModal";
import { TripRosterModal } from "@/components/host/TripRosterModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// The Host Dashboard tab (#tab-host-dashboard in the old site). Four states,
// same as renderHostStatusCard() drove there: no application yet, pending
// review, rejected (with reason), or verified (the real dashboard).
export default function HostDashboardPage() {
  const { user, requireAuth } = useAuth();
  const { message, showToast } = useToast();

  const [hostStatus, setHostStatus] = useState<HostStatus | null | undefined>(undefined);
  const [statusError, setStatusError] = useState(false);
  const [applicationOpen, setApplicationOpen] = useState(false);

  const [trips, setTrips] = useState<HostTrip[]>([]);
  const [bookings, setBookings] = useState<HostBookingRow[]>([]);
  const [reviewStats, setReviewStats] = useState<HostReviewStats | null>(null);
  const [dashStatus, setDashStatus] = useState<"loading" | "ready" | "error">("loading");

  const [tripFormOpen, setTripFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<HostTrip | null>(null);
  const [rosterTrip, setRosterTrip] = useState<HostTrip | null>(null);
  const [cancellingTrip, setCancellingTrip] = useState<HostTrip | null>(null);
  const [cancellingBusy, setCancellingBusy] = useState(false);

  const loadStatus = useCallback(() => {
    if (!user) return;
    setHostStatus(undefined);
    setStatusError(false);
    fetchHostStatus(user.id)
      .then(setHostStatus)
      .catch((err) => {
        console.error("Could not load host status:", err);
        setStatusError(true);
      });
  }, [user]);

  const loadDashboard = useCallback(() => {
    if (!user) return;
    setDashStatus("loading");
    fetchHostDashboard(user.id)
      .then(({ trips, bookings, reviewStats }) => {
        setTrips(trips);
        setBookings(bookings);
        setReviewStats(reviewStats);
        setDashStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load host dashboard:", err);
        setDashStatus("error");
      });
  }, [user]);

  async function handleConfirmCancelTrip() {
    if (!cancellingTrip) return;
    setCancellingBusy(true);
    try {
      await cancelTrip(cancellingTrip.id);
      showToast("Trip cancelled.");
      setCancellingTrip(null);
      loadDashboard();
    } catch (err) {
      console.error("Could not cancel trip:", err);
      showToast("Could not cancel this trip -- please try again.");
    } finally {
      setCancellingBusy(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (hostStatus?.verification_status === "verified") {
      loadDashboard();
    }
  }, [hostStatus, loadDashboard]);

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="text-3xl">⚓</div>
          <h1 className="text-lg font-bold text-white">Sign in to access the Host Dashboard</h1>
          <p className="text-xs text-slate-400">
            Hosts manage their dive trips and bookings from here once signed in.
          </p>
          <button
            onClick={() => requireAuth()}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  if (statusError) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <p className="text-xs text-rose-400 text-center py-12">
          Could not load your host status -- please refresh.
        </p>
      </main>
    );
  }

  // Status still loading
  if (hostStatus === undefined) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <p className="text-xs text-slate-500 text-center py-12">Loading…</p>
      </main>
    );
  }

  // No application yet
  if (hostStatus === null) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="text-3xl">🤿</div>
          <h1 className="text-lg font-bold text-white">Become a UiDive Host</h1>
          <p className="text-xs text-slate-400">
            Run dive trips, manage bookings, and get discovered by divers near you.
          </p>
          <button
            onClick={() => setApplicationOpen(true)}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            Apply to Become a Host
          </button>
        </div>
        {applicationOpen && (
          <HostApplicationForm
            onClose={() => setApplicationOpen(false)}
            onSubmitted={() => {
              setApplicationOpen(false);
              showToast("Application submitted! We'll review it shortly.");
              loadStatus();
            }}
          />
        )}
        <Toast message={message} />
      </main>
    );
  }

  // Pending review
  if (hostStatus.verification_status === "pending") {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-3">
          <div className="text-3xl">⏳</div>
          <h1 className="text-lg font-bold text-white">Application Under Review</h1>
          <p className="text-xs text-slate-400">
            Thanks for applying, {hostStatus.business_name}! Our team is reviewing your host
            application. We&apos;ll let you know as soon as it&apos;s approved.
          </p>
        </div>
      </main>
    );
  }

  // Rejected
  if (hostStatus.verification_status === "rejected") {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-3">
          <div className="text-3xl">✕</div>
          <h1 className="text-lg font-bold text-white">Application Not Approved</h1>
          {hostStatus.rejection_reason && (
            <p className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
              {hostStatus.rejection_reason}
            </p>
          )}
          <p className="text-xs text-slate-400">
            You can reach out to support if you think this was a mistake.
          </p>
        </div>
      </main>
    );
  }

  // Suspended
  if (hostStatus.verification_status === "suspended") {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-3">
          <div className="text-3xl">🚫</div>
          <h1 className="text-lg font-bold text-white">Host Account Suspended</h1>
          <p className="text-xs text-slate-400">
            Contact support if you believe this is a mistake.
          </p>
        </div>
      </main>
    );
  }

  // Verified -- the real dashboard
  const activeTrips = trips.filter((t) => t.status === "active");
  const now = new Date();
  const upcomingTrips = activeTrips.filter(
    (t) => t.scheduled_date && new Date(t.scheduled_date + "T00:00:00") >= new Date(now.toDateString())
  );
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.price_paid || 0), 0);
  const totalCapacity = activeTrips.reduce((sum, t) => sum + (t.capacity || 0), 0);
  const totalBooked = activeTrips.reduce((sum, t) => sum + (t.spots_booked || 0), 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-black text-white flex items-center gap-2 justify-center sm:justify-start">
              <Anchor className="w-6 h-6 text-cyan-400" /> Host Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">Create and manage your own dive trips</p>
          </div>
          <button
            onClick={() => {
              setEditingTrip(null);
              setTripFormOpen(true);
            }}
            className="shrink-0 flex items-center gap-2 text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Create Trip
          </button>
        </div>

        {/* ANALYTICS GRID */}
        {dashStatus === "loading" && (
          <p className="text-xs text-slate-500 text-center py-6">Loading…</p>
        )}
        {dashStatus === "error" && (
          <p className="text-xs text-rose-400 text-center py-6">
            Could not load your dashboard -- please refresh.
          </p>
        )}
        {dashStatus === "ready" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <Stat icon={<Anchor className="w-4 h-4" />} label="Active Trips" value={activeTrips.length} />
              <Stat
                icon={<CalendarDays className="w-4 h-4" />}
                label="Upcoming"
                value={upcomingTrips.length}
              />
              <Stat icon={<Users className="w-4 h-4" />} label="Total Bookings" value={confirmedBookings.length} />
              <Stat
                icon={<DollarSign className="w-4 h-4" />}
                label="Revenue"
                value={`$${totalRevenue.toFixed(2)}`}
              />
              <Stat icon={<Gauge className="w-4 h-4" />} label="Fill Rate" value={`${fillRate}%`} />
              <Stat
                icon={<Star className="w-4 h-4" />}
                label={reviewStats && reviewStats.review_count > 0 ? `Avg Rating (${reviewStats.review_count})` : "Avg Rating"}
                value={reviewStats && reviewStats.review_count > 0 ? `★ ${reviewStats.avg_rating.toFixed(1)}` : "—"}
              />
            </div>

            {/* TRIPS LIST */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <List className="w-5 h-5 text-emerald-400" /> My Trips
              </h2>

              {trips.length === 0 && (
                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <div className="text-3xl">🗓️</div>
                  <p className="text-sm font-bold text-slate-300">No trips yet</p>
                  <p className="text-xs text-slate-500">Create your first trip and it&apos;ll show up here.</p>
                </div>
              )}

              {trips.length > 0 && (
                <div className="space-y-3">
                  {trips.map((trip) => {
                    const dateStr = trip.scheduled_date
                      ? (() => {
                          const d = new Date(trip.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          });
                          return trip.scheduled_time ? `${d} • ${trip.scheduled_time}` : d;
                        })()
                      : trip.scheduled_time || "";
                    const isCancelled = trip.status === "cancelled";
                    const spotsLeft = (trip.capacity || 0) - (trip.spots_booked || 0);

                    return (
                      <div
                        key={trip.id}
                        className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 ${
                          isCancelled ? "opacity-60" : ""
                        } flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-white truncate">{trip.title}</p>
                            {isCancelled && (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                                Cancelled
                              </span>
                            )}
                            {!isCancelled && spotsLeft <= 0 && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                Full
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {trip.location} • {dateStr}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {trip.spots_booked || 0}/{trip.capacity || 0} booked • $
                            {Number(trip.price || 0).toFixed(2)}/diver
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => setRosterTrip(trip)}
                            className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 px-3 py-2 rounded-xl transition-colors"
                          >
                            Divers
                          </button>
                          {!isCancelled && (
                            <button
                              onClick={() => {
                                setEditingTrip(trip);
                                setTripFormOpen(true);
                              }}
                              className="text-[10px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition-colors"
                            >
                              Edit
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              onClick={() => setCancellingTrip(trip)}
                              className="text-[10px] font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 px-3 py-2 rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {tripFormOpen && (
        <TripFormModal
          trip={editingTrip}
          onClose={() => setTripFormOpen(false)}
          onSaved={() => {
            setTripFormOpen(false);
            showToast(editingTrip ? "Trip updated." : "Trip created.");
            loadDashboard();
          }}
        />
      )}
      {rosterTrip && <TripRosterModal trip={rosterTrip} onClose={() => setRosterTrip(null)} />}
      {cancellingTrip && (
        <ConfirmModal
          title={`Cancel "${cancellingTrip.title}"?`}
          message="This can't be undone."
          confirmLabel="Cancel Trip"
          cancelLabel="Keep Trip"
          confirming={cancellingBusy}
          onConfirm={handleConfirmCancelTrip}
          onCancel={() => setCancellingTrip(null)}
        />
      )}
      <Toast message={message} />
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-center">
      <div className="text-cyan-400 mx-auto mb-1 w-fit">{icon}</div>
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{label}</div>
    </div>
  );
}
