"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Anchor,
  CalendarDays,
  DollarSign,
  Gauge,
  Star,
  TrendingUp,
  Users,
  Plus,
  Pencil,
  XCircle,
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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Anchor className="w-6 h-6 text-cyan-400" /> Host Dashboard
            </h1>
            <p className="text-xs text-slate-400">{hostStatus.business_name}</p>
          </div>
          <button
            onClick={() => {
              setEditingTrip(null);
              setTripFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                value={`$${totalRevenue.toLocaleString()}`}
                accent="emerald"
              />
              <Stat icon={<Gauge className="w-4 h-4" />} label="Fill Rate" value={`${fillRate}%`} />
              <Stat
                icon={<Star className="w-4 h-4" />}
                label="Avg Rating"
                value={reviewStats ? reviewStats.avg_rating.toFixed(1) : "—"}
                accent="amber"
              />
            </div>

            {/* TRIPS LIST */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" /> Your Trips
              </h2>

              {trips.length === 0 && (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <div className="text-3xl">🌊</div>
                  <p className="text-sm font-bold text-slate-300">No trips yet</p>
                  <p className="text-xs text-slate-500">Create your first dive trip to get started.</p>
                </div>
              )}

              {trips.length > 0 && (
                <div className="space-y-3">
                  {trips.map((trip) => {
                    const dateStr = trip.scheduled_date
                      ? new Date(trip.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "No date set";
                    const isFull = trip.spots_booked >= trip.capacity;

                    return (
                      <div
                        key={trip.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-extrabold text-white truncate">{trip.title}</h4>
                            {trip.status === "cancelled" && (
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-0.5 rounded-full">
                                Cancelled
                              </span>
                            )}
                            {trip.status === "active" && isFull && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                                Full
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {trip.location} • {dateStr}
                            {trip.scheduled_time ? ` • ${trip.scheduled_time}` : ""}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {trip.spots_booked}/{trip.capacity} booked • ${Number(trip.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setRosterTrip(trip)}
                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors"
                            title="View roster"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingTrip(trip);
                              setTripFormOpen(true);
                            }}
                            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/70 transition-colors"
                            title="Edit trip"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {trip.status === "active" && (
                            <button
                              onClick={async () => {
                                if (!window.confirm(`Cancel "${trip.title}"? This can't be undone.`)) return;
                                try {
                                  await cancelTrip(trip.id);
                                  showToast("Trip cancelled.");
                                  loadDashboard();
                                } catch (err) {
                                  console.error("Could not cancel trip:", err);
                                  showToast("Could not cancel this trip -- please try again.");
                                }
                              }}
                              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-slate-800/70 transition-colors"
                              title="Cancel trip"
                            >
                              <XCircle className="w-4 h-4" />
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
      <Toast message={message} />
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: "emerald" | "amber";
}) {
  const valueColor =
    accent === "emerald" ? "text-emerald-400" : accent === "amber" ? "text-amber-400" : "text-white";
  return (
    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
      <div className="flex items-center gap-1.5 text-slate-500">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-lg font-black ${valueColor}`}>{value}</div>
    </div>
  );
}
