"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, CalendarCheck, Grid, ChevronRight, Pencil, ShieldCheck, Compass, Store, BadgeCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast, Toast } from "@/components/Toast";
import {
  MyBooking,
  MyPost,
  diverIdFromUserId,
  fetchMyBookings,
  fetchMyPosts,
} from "@/lib/profile";
import { fetchBuddiesCount } from "@/lib/social";
import { fetchHostStatus, HostStatus } from "@/lib/host";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { BookingDetailModal } from "@/components/profile/BookingDetailModal";
import { diverCertRingClass } from "@/lib/diverRing";

// The Profile tab (#tab-profile in the old site). Treasure Chest cosmetics
// (calling card banner, equipped avatar, diver rings) are a separate
// subsystem not migrated yet -- this covers the real header info (including
// the admin/verified-host badges and real buddies count), bookings list +
// full booking detail (roster/cancel/review), and dive-log grid.
export default function ProfilePage() {
  const { user, requireAuth } = useAuth();
  const { message, showToast } = useToast();
  const [editOpen, setEditOpen] = useState(false);

  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [bookingsStatus, setBookingsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [postsStatus, setPostsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedBooking, setSelectedBooking] = useState<MyBooking | null>(null);
  const [buddiesCount, setBuddiesCount] = useState(0);
  const [hostStatus, setHostStatus] = useState<HostStatus | null>(null);

  function loadBookings() {
    if (!user) return;
    fetchMyBookings(user.id)
      .then(setBookings)
      .then(() => setBookingsStatus("ready"))
      .catch((err) => {
        console.error("Could not load bookings:", err);
        setBookingsStatus("error");
      });
  }

  useEffect(() => {
    if (!user) return;
    loadBookings();
    fetchMyPosts(user.id)
      .then(setPosts)
      .then(() => setPostsStatus("ready"))
      .catch((err) => {
        console.error("Could not load your posts:", err);
        setPostsStatus("error");
      });
    fetchBuddiesCount(user.id)
      .then(setBuddiesCount)
      .catch((err) => console.error("Could not load your buddies count:", err));
    fetchHostStatus(user.id)
      .then(setHostStatus)
      .catch((err) => console.error("Could not load host status:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="text-3xl">🤿</div>
          <h1 className="text-lg font-bold text-white">Sign in to view your profile</h1>
          <p className="text-xs text-slate-400">
            Track your dives, Corals, and bookings once you&apos;re signed in.
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

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* PROFILE HEADER */}
        <div className="relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
            <div className="relative shrink-0 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar}
                alt="Your profile photo"
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 shadow-lg ${diverCertRingClass(user.cert)}`}
              />
              <button
                onClick={() => setEditOpen(true)}
                aria-label="Edit profile photo"
                title="Edit profile"
                className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Pencil className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white">{user.name}</h1>
                <div className="flex items-center gap-1.5">
                  {user.is_admin && (
                    <div
                      className="w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/40 flex items-center justify-center"
                      title="Site Admin -- Review Host Applications"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
                    </div>
                  )}
                  {hostStatus?.verification_status === "verified" && (
                    <div
                      className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center"
                      title={
                        hostStatus.host_type === "shop"
                          ? "Verified Dive Shop"
                          : hostStatus.host_type === "both"
                            ? "Verified Dive Shop & Divemaster"
                            : "Verified Divemaster"
                      }
                    >
                      {hostStatus.host_type === "shop" ? (
                        <Store className="w-3.5 h-3.5 text-emerald-300" />
                      ) : hostStatus.host_type === "both" ? (
                        <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" />
                      ) : (
                        <Compass className="w-3.5 h-3.5 text-emerald-300" />
                      )}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs font-bold text-cyan-400 flex items-center justify-center sm:justify-start gap-1">
                <Award className="w-4 h-4" /> {user.cert} • {user.location}
              </p>
              <p className="text-xs text-slate-400 max-w-md">{user.bio}</p>
              <p className="text-[10px] font-mono font-bold text-slate-500">
                Diver ID: #{diverIdFromUserId(user.id)}
              </p>
              <button
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl hover:bg-cyan-500/20 transition-colors mt-1"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
            <div className="p-2 sm:p-2.5 bg-slate-950 rounded-2xl border border-slate-800 text-center sm:min-w-[74px]">
              <div className="text-base sm:text-lg font-black text-white">
                {Number(user.dives).toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">Dives</div>
            </div>
            <Link
              href="/inbox"
              className="p-2 sm:p-2.5 bg-slate-950 hover:bg-slate-800 rounded-2xl border border-slate-800 hover:border-cyan-500/40 text-center sm:min-w-[74px] transition-colors"
            >
              <div className="text-base sm:text-lg font-black text-cyan-400">
                {Number(buddiesCount).toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">Buddies</div>
            </Link>
            <div className="p-2 sm:p-2.5 bg-slate-950 rounded-2xl border border-amber-500/30 text-center sm:min-w-[74px]">
              <div className="text-base sm:text-lg font-black text-amber-400">
                {Number(user.corals).toLocaleString()}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">Corals</div>
            </div>
          </div>
        </div>

        {/* MY BOOKINGS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-400" /> My Bookings
          </h2>

          {bookingsStatus === "loading" && (
            <p className="text-xs text-slate-500 text-center py-6">Loading…</p>
          )}
          {bookingsStatus === "error" && (
            <p className="text-xs text-rose-400 text-center py-6">
              Could not load your bookings -- please refresh.
            </p>
          )}
          {bookingsStatus === "ready" && bookings.length === 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">🤿</div>
              <p className="text-sm font-bold text-slate-300">No bookings yet</p>
              <p className="text-xs text-slate-500">
                Book a dive trip and it&apos;ll show up here once payment&apos;s confirmed.
              </p>
            </div>
          )}
          {bookingsStatus === "ready" && bookings.length > 0 && (
            <div className="space-y-3">
              {bookings.map((b) => {
                const trip = b.dive_trips || {
                  title: "Dive trip",
                  location: "",
                  scheduled_date: null,
                  scheduled_time: "",
                };
                const dateStr = trip.scheduled_date
                  ? new Date(trip.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })
                  : "";
                const statusBadge =
                  b.status === "refunded" ? (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                      Refunded
                    </span>
                  ) : b.status === "cancelled" ? (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/30 px-2 py-0.5 rounded-full">
                      Cancelled
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Confirmed
                    </span>
                  );

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBooking(b)}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4 cursor-pointer transition-colors hover:bg-slate-800/80 hover:border-cyan-500/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-white truncate">{trip.title}</h4>
                        {statusBadge}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {trip.location}
                        {dateStr ? ` • ${dateStr}` : ""}
                        {trip.scheduled_time ? ` • ${trip.scheduled_time}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-black text-cyan-400">
                        ${Number(b.price_paid)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MY DIVE LOGS */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-cyan-400" /> My Dive Logs &amp; Photos
          </h2>

          {postsStatus === "loading" && (
            <p className="text-xs text-slate-500 text-center py-6">Loading…</p>
          )}
          {postsStatus === "error" && (
            <p className="text-xs text-rose-400 text-center py-6">
              Could not load your posts -- please refresh.
            </p>
          )}
          {postsStatus === "ready" && posts.length === 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
              <div className="text-3xl">📸</div>
              <p className="text-sm font-bold text-slate-300">No dive logs yet</p>
              <p className="text-xs text-slate-500">
                Share a photo or dive log from the Community tab and it&apos;ll show up here.
              </p>
            </div>
          )}
          {postsStatus === "ready" && posts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-square cursor-pointer group"
                  onClick={() => showToast("Jumping to your Community post is coming in a future update.")}
                >
                  {post.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.image_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-slate-400">
                      {post.caption || post.location_name || "Dive log"}
                    </div>
                  )}
                  {post.corals_awarded && (
                    <span className="absolute top-2 left-2 text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-sm border border-amber-200/30">
                      +10 🪸
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onChanged={loadBookings}
        />
      )}
      <Toast message={message} />
    </main>
  );
}
