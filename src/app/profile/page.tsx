"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  CalendarCheck,
  Grid,
  ChevronRight,
  Pencil,
  ShieldCheck,
  Compass,
  Store,
  BadgeCheck,
  Anchor,
  Clock,
  XCircle,
  Ban,
  MoreVertical,
  Share2,
  Trash2,
  MapPin,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast, Toast } from "@/components/Toast";
import {
  MyBooking,
  MyPost,
  diverIdFromUserId,
  fetchMyBookings,
  fetchMyPosts,
  tripHasPassed,
} from "@/lib/profile";
import { fetchBuddiesCount } from "@/lib/social";
import { fetchHostStatus, HostStatus } from "@/lib/host";
import { deletePost } from "@/lib/posts";
import { fetchTrips, DiveTrip } from "@/lib/trips";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { BuddiesListModal } from "@/components/social/BuddiesListModal";
import { BookingDetailModal } from "@/components/profile/BookingDetailModal";
import { AdminPanelModal } from "@/components/admin/AdminPanelModal";
import { DiverAvatar } from "@/components/DiverAvatar";
import { ProfileStatPill } from "@/components/ProfileStatPill";
import { PostFormModal } from "@/components/community/PostFormModal";
import { COSMETIC_CATALOG } from "@/lib/cosmetics";

// The Profile tab (#tab-profile in the old site), including Treasure Chest
// cosmetics (the equipped calling-card banner behind the header and the
// equipped avatar via DiverAvatar -- see src/lib/cosmetics.ts) alongside the
// real header info (admin/verified-host badges, real buddies count),
// bookings list + full booking detail (roster/cancel/review), and dive-log
// grid. The Locker launcher itself now lives in the site Header's account
// dropdown as "My Dive Bag" so it's reachable from every page, not just here.
export default function ProfilePage() {
  const { user, requireAuth } = useAuth();
  const { message, showToast } = useToast();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [bookingsStatus, setBookingsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [postsStatus, setPostsStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedBooking, setSelectedBooking] = useState<MyBooking | null>(null);
  const [buddiesCount, setBuddiesCount] = useState(0);
  const [hostStatus, setHostStatus] = useState<HostStatus | null | undefined>(undefined);
  const [openPostMenuId, setOpenPostMenuId] = useState<string | null>(null);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [buddiesListOpen, setBuddiesListOpen] = useState(false);
  const [trips, setTrips] = useState<DiveTrip[]>([]);
  const [editingPost, setEditingPost] = useState<MyPost | null>(null);

  function loadPosts() {
    if (!user) return;
    fetchMyPosts(user.id)
      .then(setPosts)
      .then(() => setPostsStatus("ready"))
      .catch((err) => {
        console.error("Could not load your posts:", err);
        setPostsStatus("error");
      });
  }

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
    loadPosts();
    fetchBuddiesCount(user.id)
      .then(setBuddiesCount)
      .catch((err) => console.error("Could not load your buddies count:", err));
    fetchHostStatus(user.id)
      .then(setHostStatus)
      .catch((err) => console.error("Could not load host status:", err));
    // Needed for the edit-post form's "linked trip" dropdown, same as the
    // Community tab -- only fetched once, not re-fetched on every post edit.
    fetchTrips()
      .then(({ trips }) => setTrips(trips))
      .catch((err) => console.error("Could not load dive trips:", err));
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
        {(() => {
          const equippedCard = user.equipped_calling_card_id
            ? COSMETIC_CATALOG[user.equipped_calling_card_id]
            : null;
          const cardItem = equippedCard && equippedCard.type === "calling_card" ? equippedCard : null;
          return (
        <div
          className={`relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 shadow-xl ${cardItem ? "always-dark" : ""}`}
        >
          {/* Equipped Calling Card banner (Treasure Chest cosmetics) -- sits
              behind everything else in this header. object-cover on a
              right-anchored half-width strip with a left-fade mask shows the
              card art without a hard rectangle edge, same treatment as the
              public-profile header. */}
          {cardItem && (
            <div className="hidden sm:block absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardItem.image}
                alt=""
                className="absolute inset-y-0 right-0 h-full w-1/2 sm:w-2/5 object-cover"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 45%)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 45%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            </div>
          )}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
            <div className="relative shrink-0 group">
              <DiverAvatar
                avatarUrl={user.avatar}
                equippedAvatarId={user.equipped_avatar_id}
                cert={user.cert}
                isVerifiedHost={hostStatus?.verification_status === "verified"}
                alt="Your profile photo"
                sizeClass="w-20 h-20 sm:w-24 sm:h-24"
                borderClass="border-4 shadow-lg"
              />
              {/* always-dark: this hover scrim sits directly on the user's
                  own profile photo, so it needs to stay a dark dimming
                  overlay (with a white pencil icon) in both themes -- the
                  same "glass chip on a photo" treatment as PostCard.tsx's
                  photo overlay. Without it, light mode's generic overrides
                  would turn this into a light tint behind a dark icon,
                  breaking the guaranteed contrast this scrim exists for. */}
              <button
                onClick={() => setEditOpen(true)}
                aria-label="Edit profile photo"
                title="Edit profile"
                className="always-dark absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                <Pencil className="w-6 h-6 text-white" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                {/* Diver ID moved off its own line -- it's niche info most
                    visitors to this page (just the signed-in diver) never
                    need visible by default, so it's tucked behind a hover
                    tooltip on the name instead, same pattern as the
                    admin/verified-host badge tooltips right next to it. */}
                <div className="relative group">
                  <h1 className="text-xl sm:text-2xl font-black text-white cursor-default">{user.name}</h1>
                  <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-20 shadow-xl">
                    Diver ID: #{diverIdFromUserId(user.id)}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {user.is_admin && (
                    <div className="relative group">
                      <button
                        onClick={() => setAdminPanelOpen(true)}
                        className="w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/40 flex items-center justify-center hover:bg-violet-500/25 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
                      </button>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-20 shadow-xl">
                        Site Admin -- Review Host Applications
                      </div>
                    </div>
                  )}
                  {hostStatus?.verification_status === "verified" && (
                    <div className="relative group">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center cursor-default">
                        {hostStatus.host_type === "shop" ? (
                          <Store className="w-3.5 h-3.5 text-emerald-300" />
                        ) : hostStatus.host_type === "both" ? (
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Compass className="w-3.5 h-3.5 text-emerald-300" />
                        )}
                      </div>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-20 shadow-xl">
                        {hostStatus.host_type === "shop"
                          ? "Verified Dive Shop"
                          : hostStatus.host_type === "both"
                            ? "Verified Dive Shop & Divemaster"
                            : "Verified Divemaster"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* Dives/Buddies/Corals -- pill-shaped "frosted glass" stat
                  chips (panel-sunken + bg-slate-950/60 + backdrop-blur is the
                  same sunken-panel treatment the hero search bar and
                  leaderboard runner-up cards use, so it already has a
                  light-mode-safe background via globals.css instead of
                  needing a new always-dark hook). Sits right under the name
                  row, above cert/location and the bio. */}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <ProfileStatPill label="Dives" value={user.dives} />
                <ProfileStatPill label="Buddies" value={buddiesCount} accent="cyan" onClick={() => setBuddiesListOpen(true)} />
                <ProfileStatPill label="Corals" value={user.corals} accent="amber" />
              </div>

              <p className="text-xs font-bold text-cyan-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Award className="w-4 h-4 shrink-0" /> {user.cert} • {user.location}
              </p>

              {/* Indented to sit flush under the cert line's text (icon
                  width + its gap) rather than under the icon itself -- reads
                  as a continuation of that line instead of a separate
                  flush-left block. Only applied at sm+, where the header is
                  actually left-aligned; centered on mobile, so padding there
                  would just skew it off-center. */}
              {user.bio && (
                <p className="text-xs text-slate-400 max-w-md sm:pl-[22px]">{user.bio}</p>
              )}
            </div>
          </div>
        </div>
          );
        })()}

        {/* HOST STATUS -- verified hosts just get the badge above; this card
            only covers the states that need an action: apply, pending,
            rejected, or suspended. */}
        {hostStatus === null && (
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <Anchor className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Run dive trips of your own?</p>
                <p className="text-xs text-slate-400">
                  Apply as a Dive Shop or Divemaster host once verified.
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/host-dashboard")}
              className="shrink-0 text-xs font-bold text-slate-950 bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 rounded-xl transition-colors"
            >
              Become a Host
            </button>
          </div>
        )}
        {hostStatus?.verification_status === "pending" && (
          <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-300">Host Application Under Review</p>
              <p className="text-xs text-amber-200/80">
                We&apos;re verifying your details -- this usually doesn&apos;t take long.
              </p>
            </div>
          </div>
        )}
        {hostStatus?.verification_status === "rejected" && (
          <div className="p-5 sm:p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-rose-300">Host Application Not Approved</p>
                <p className="text-xs text-rose-200/80">
                  {hostStatus.rejection_reason || "No reason was given."}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/host-dashboard")}
              className="text-xs font-bold text-rose-300 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 px-4 py-2 rounded-xl transition-colors"
            >
              Reapply
            </button>
          </div>
        )}
        {hostStatus?.verification_status === "suspended" && (
          <div className="p-5 sm:p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
              <Ban className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-rose-300">Host Account Suspended</p>
              <p className="text-xs text-rose-200/80">Contact support if you believe this is a mistake.</p>
            </div>
          </div>
        )}

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
                  ) : b.status === "confirmed" && tripHasPassed(b.dive_trips) ? (
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                      Completed
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
              {posts.map((post) => {
                const when = new Date(post.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const headline = post.caption || post.location_name || "Dive log";

                function goToPost() {
                  router.push(`/community?post=${post.id}`);
                }

                async function handleShare() {
                  setOpenPostMenuId(null);
                  const parts: string[] = [];
                  if (post.caption) parts.push(post.caption);
                  if (post.location_name) parts.push(`📍 ${post.location_name}`);
                  const shareText = parts.length ? parts.join(" — ") : "Check out my dive log on UiDive!";
                  const shareUrl = `${window.location.origin}/community?post=${post.id}`;
                  if (navigator.share) {
                    try {
                      await navigator.share({ title: "UiDive Dive Log", text: shareText, url: shareUrl });
                    } catch {
                      // AbortError just means the share sheet was closed -- not worth surfacing.
                    }
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
                    showToast("🔗 Copied to clipboard -- paste it anywhere to share!");
                  } catch {
                    showToast("❌ Could not share -- try copying the link manually.");
                  }
                }

                async function handleDelete() {
                  setOpenPostMenuId(null);
                  if (!window.confirm("Delete this dive log? This can't be undone.")) return;
                  try {
                    await deletePost(post.id);
                    setPosts((prev) => prev.filter((p) => p.id !== post.id));
                  } catch (err) {
                    console.error("Could not delete post:", err);
                    showToast("Could not delete that post -- please try again.");
                  }
                }

                const menu = (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="always-dark absolute top-3 right-3 z-20"
                  >
                    <button
                      onClick={() => setOpenPostMenuId((v) => (v === post.id ? null : post.id))}
                      className={`w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 ${
                        openPostMenuId === post.id ? "sm:opacity-100" : ""
                      }`}
                      aria-label="Post options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openPostMenuId === post.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-30">
                        <button
                          onClick={() => {
                            setOpenPostMenuId(null);
                            setEditingPost(post);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={handleShare}
                          className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share
                        </button>
                        <button
                          onClick={handleDelete}
                          className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                );

                if (post.image_url) {
                  return (
                    <div
                      key={post.id}
                      onClick={goToPost}
                      className="relative group rounded-2xl overflow-hidden h-64 border border-slate-800 shadow-md bg-slate-800 cursor-pointer transition-all hover:border-cyan-500/50 hover:ring-2 hover:ring-cyan-500/30"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image_url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.corals_awarded && (
                        <div className="always-dark absolute top-3 left-3 z-10">
                          <span className="relative inline-flex items-center gap-1 text-[11px] font-extrabold text-white pl-1.5 pr-2.5 py-1 rounded-full overflow-hidden isolate backdrop-blur-md bg-orange-400/10 border border-orange-200/40 shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                            <span className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-200/35 via-cyan-300/10 to-amber-300/25" />
                            <span className="absolute inset-x-0 top-0 h-1/2 -z-10 bg-gradient-to-b from-white/50 to-transparent" />
                            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">+10</span>
                            <span>🪸</span>
                          </span>
                        </div>
                      )}
                      {menu}
                      <div className="always-dark absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-4 flex flex-col justify-end">
                        <p className="text-xs font-bold text-white truncate">{headline}</p>
                        <p className="text-[10px] text-slate-300">
                          Logged {when}
                          {post.location_name && post.caption ? ` • ${post.location_name}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={post.id}
                    onClick={goToPost}
                    className="relative group rounded-2xl overflow-hidden h-64 border border-slate-800 shadow-md bg-slate-900 p-5 flex flex-col justify-between cursor-pointer transition-all hover:border-cyan-500/50 hover:bg-slate-800/80"
                  >
                    {menu}
                    <p className="text-sm text-slate-200 leading-relaxed line-clamp-6 pr-8">{headline}</p>
                    <div>
                      {post.location_name && (
                        <p className="text-xs text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5" /> {post.location_name}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-slate-500">Logged {when}</p>
                        {post.corals_awarded && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                            +10 🪸
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editOpen && <EditProfileModal onClose={() => setEditOpen(false)} />}
      {adminPanelOpen && <AdminPanelModal onClose={() => setAdminPanelOpen(false)} />}
      {buddiesListOpen && user && (
        <BuddiesListModal userId={user.id} onClose={() => setBuddiesListOpen(false)} />
      )}
      {editingPost && (
        <PostFormModal
          trips={trips}
          editingPost={editingPost}
          onClose={() => setEditingPost(null)}
          onSaved={() => {
            setEditingPost(null);
            loadPosts();
            showToast("✅ Dive log updated!");
          }}
        />
      )}
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
