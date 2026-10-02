"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Award,
  Grid,
  MapPin,
  MoreVertical,
  Flag,
  Ban,
  UserPlus,
  MessageSquare,
  Compass,
  Store,
  BadgeCheck,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useSocial } from "@/components/social/SocialContext";
import { useToast, Toast } from "@/components/Toast";
import {
  PublicProfile,
  PublicPost,
  PublicHostBadge,
  FriendshipStatus,
  fetchPublicProfile,
  fetchPublicProfilePosts,
  fetchBuddiesCount,
  fetchFriendshipStatus,
  fetchPublicHostBadge,
  isUserBlocked,
  toggleBlockUser,
} from "@/lib/social";
import { sendBuddyRequest } from "@/lib/inbox";
import { fetchDiveCount } from "@/lib/dive-log";
import { ChatModal } from "@/components/inbox/ChatModal";
import { DiverAvatar } from "@/components/DiverAvatar";
import { ProfileStatPill } from "@/components/ProfileStatPill";
import { COSMETIC_CATALOG, resolveAvatarUrl } from "@/lib/cosmetics";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useClickOutside } from "@/lib/useClickOutside";

// Migrated from the old site's #public-profile-modal (viewPublicProfile()),
// including the equipped calling-card banner / avatar ring cosmetics.
export function PublicProfileModal() {
  const { user, requireAuth } = useAuth();
  const { profileUserId, closeProfile, openReport } = useSocial();
  const router = useRouter();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [buddiesCount, setBuddiesCount] = useState(0);
  const [diveCount, setDiveCount] = useState(0);
  const [hostBadge, setHostBadge] = useState<PublicHostBadge | null>(null);
  const [friendship, setFriendship] = useState<FriendshipStatus>("none");
  const [blocked, setBlocked] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [diverIdCopied, setDiverIdCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));
  const { message, showToast } = useToast();

  // Matches the signed-in Profile page: the name is clickable to copy this
  // diver's ID to the clipboard, so it doubles as the "share their Diver ID"
  // action without a separate button.
  async function copyDiverId(id: string | number) {
    try {
      await navigator.clipboard.writeText(String(id));
      setDiverIdCopied(true);
      showToast("📋 Diver ID copied to clipboard!");
      window.setTimeout(() => setDiverIdCopied(false), 1500);
    } catch (err) {
      console.error("Could not copy Diver ID:", err);
      showToast("❌ Could not copy -- please try again.");
    }
  }

  useEffect(() => {
    if (!profileUserId) return;
    setStatus("loading");
    setMenuOpen(false);
    setRequestSent(false);
    Promise.all([
      fetchPublicProfile(profileUserId),
      fetchPublicProfilePosts(profileUserId),
      fetchBuddiesCount(profileUserId),
      fetchDiveCount(profileUserId),
      fetchPublicHostBadge(profileUserId),
      user ? fetchFriendshipStatus(user.id, profileUserId) : Promise.resolve<FriendshipStatus>("none"),
      user ? isUserBlocked(user.id, profileUserId) : Promise.resolve(false),
    ])
      .then(([p, posts, count, dives, badge, fs, isBlocked]) => {
        setProfile(p);
        setPosts(posts);
        setBuddiesCount(count);
        setDiveCount(dives);
        setHostBadge(badge);
        setFriendship(fs);
        setBlocked(isBlocked);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load that profile:", err);
        setStatus("error");
      });
  }, [profileUserId, user]);

  useEscapeClose(closeProfile);

  if (!profileUserId) return null;

  async function handleSendRequest() {
    if (!user || !profile) return;
    try {
      await sendBuddyRequest(user.id, profile.id);
      setRequestSent(true);
      setFriendship("pending");
    } catch (err) {
      console.error("Could not send buddy request:", err);
    }
  }

  const equippedCard = profile?.equipped_calling_card_id ? COSMETIC_CATALOG[profile.equipped_calling_card_id] : null;
  const cardItem = equippedCard && equippedCard.type === "calling_card" ? equippedCard : null;

  async function handleToggleBlock() {
    if (!profile) return;
    const firstName = profile.name.split(" ")[0];
    const msg = blocked
      ? `Unblock ${firstName}?`
      : `Block ${firstName}? You won't see their posts or comments, and they won't be able to message you. You can unblock them later.`;
    if (!window.confirm(msg)) return;
    try {
      const nowBlocked = await toggleBlockUser(profile.id);
      setBlocked(nowBlocked);
      setMenuOpen(false);
    } catch (err) {
      console.error("Could not update block status:", err);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProfile();
      }}
    >
      <div className="bg-slate-950 border border-slate-800 w-full max-w-5xl rounded-3xl p-5 sm:p-8 space-y-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start -mt-1 -mr-1">
          <div className="relative" ref={menuRef}>
            {user && (
              <>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                  aria-label="Profile options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {menuOpen && profile && (
                  <div className="absolute left-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-30 text-left">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openReport("user", profile.id, profile.name);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <Flag className="w-3.5 h-3.5" /> Report user
                    </button>
                    <button
                      onClick={handleToggleBlock}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                    >
                      <Ban className="w-3.5 h-3.5" /> {blocked ? "Unblock user" : "Block user"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <button
            onClick={closeProfile}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === "loading" && <p className="text-xs text-slate-500 text-center py-10">Loading…</p>}
        {status === "error" && (
          <p className="text-xs text-rose-400 text-center py-10">Could not load that profile.</p>
        )}

        {status === "ready" && profile && (
          <>
            <div
              className={`relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 shadow-xl -mt-2 ${
                cardItem ? "always-dark" : ""
              }`}
            >
              {/* Equipped Calling Card banner (Treasure Chest cosmetics) --
                  a dark overlay (via always-dark above) is layered under the
                  art so name/stats on top of it stay readable regardless of
                  how bright the artwork is. calling-card-drift gives the art
                  a slow, barely-perceptible zoom/pan, matching the signed-in
                  Profile page's header treatment. */}
              {cardItem && (
                <div className="hidden absolute inset-0 rounded-3xl overflow-hidden pointer-events-none sm:block" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cardItem.image}
                    alt=""
                    className="calling-card-drift absolute inset-y-0 right-0 h-full w-1/2 object-cover"
                    style={{
                      maskImage: "linear-gradient(to right, transparent, black 45%)",
                      WebkitMaskImage: "linear-gradient(to right, transparent, black 45%)",
                    }}
                  />
                </div>
              )}
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
                <DiverAvatar
                  avatarUrl={profile.avatar_url}
                  equippedAvatarId={profile.equipped_avatar_id}
                  cert={profile.cert}
                  isVerifiedHost={!!hostBadge}
                  sizeClass="w-20 h-20 sm:w-24 sm:h-24"
                  borderClass="border-4 shadow-lg"
                />
                <div className="space-y-3">
                  {/* Same header layout as the signed-in Profile page: name
                      row (Diver ID tucked behind a hover tooltip on the name
                      instead of its own line), stat pills, cert/location,
                      then bio -- kept identical on purpose so every profile
                      (yours or anyone else's) looks the same. */}
                  <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                    <div className="relative group">
                      <h2 className="text-xl sm:text-2xl font-black text-white m-0">
                        <button
                          type="button"
                          onClick={() => copyDiverId(profile.diver_id)}
                          className="hover:text-cyan-300 transition-colors cursor-pointer"
                          title={`Click to copy ${profile.name.split(" ")[0]}'s Diver ID`}
                        >
                          {profile.name}
                        </button>
                      </h2>
                      <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 top-full mt-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-300 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-20 shadow-xl">
                        {diverIdCopied ? "Copied!" : `Diver ID: #${profile.diver_id} • Click to copy`}
                      </div>
                    </div>
                    {hostBadge && (
                      <div className="relative group">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center cursor-default">
                          {hostBadge.host_type === "shop" ? (
                            <Store className="w-3.5 h-3.5 text-emerald-300" />
                          ) : hostBadge.host_type === "both" ? (
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Compass className="w-3.5 h-3.5 text-emerald-300" />
                          )}
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 pointer-events-none z-20 shadow-xl">
                          {hostBadge.host_type === "shop"
                            ? "Verified Dive Shop"
                            : hostBadge.host_type === "both"
                              ? "Verified Dive Shop & Divemaster"
                              : "Verified Divemaster"}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-5 sm:gap-6">
                    <ProfileStatPill label="Posts" value={posts.length} accent="violet" />
                    <ProfileStatPill label="Buddies" value={buddiesCount} accent="cyan" />
                    <ProfileStatPill label="Dives" value={diveCount} />
                    <ProfileStatPill label="Corals" value={profile.corals} accent="amber" />
                  </div>

                  {/* Depth-gauge accent -- matches the signed-in Profile
                      page's header: a thin vertical line echoing a dive
                      computer's depth readout, right before the cert icon. */}
                  <p className="text-xs font-bold text-cyan-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <span
                      aria-hidden="true"
                      className="inline-block w-[3px] h-3.5 rounded-full bg-gradient-to-b from-cyan-300 via-cyan-500/70 to-transparent shrink-0"
                    />
                    <Award className="w-4 h-4 shrink-0" />
                    {profile.location ? `${profile.cert} • ${profile.location}` : profile.cert}
                  </p>

                  {profile.bio && <p className="text-xs text-slate-400 max-w-md">{profile.bio}</p>}

                  <div className="w-full sm:w-56 pt-1">
                    {!user ? (
                      <p className="text-xs text-slate-500">
                        Sign in to add {profile.name.split(" ")[0]} as a buddy.
                      </p>
                    ) : friendship === "accepted" ? (
                      <button
                        onClick={() => setChatOpen(true)}
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                    ) : friendship === "pending" || requestSent ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-800 text-slate-400 font-bold rounded-xl text-xs"
                      >
                        Request Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!requireAuth()) return;
                          handleSendRequest();
                        }}
                        className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" /> Add Buddy
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-cyan-400" /> {profile.name.split(" ")[0]}&apos;s Dive Logs &amp; Photos
              </h3>
              {posts.length === 0 ? (
                <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                  <div className="text-3xl">📸</div>
                  <p className="text-sm font-bold text-slate-300">No dive logs yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {posts.map((post) => {
                    const when = new Date(post.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    const headline = post.caption || post.location_name || "Dive log";
                    function goToPost() {
                      closeProfile();
                      router.push(`/community?post=${post.id}`);
                    }
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
                        className="relative rounded-2xl overflow-hidden h-64 border border-slate-800 shadow-md bg-slate-900 p-5 flex flex-col justify-between cursor-pointer transition-all hover:border-cyan-500/50 hover:bg-slate-800/80"
                      >
                        <p className="text-sm text-slate-200 leading-relaxed line-clamp-6">{headline}</p>
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
          </>
        )}
      </div>

      {chatOpen && profile && (
        <ChatModal
          partnerId={profile.id}
          partnerName={profile.name}
          partnerAvatar={resolveAvatarUrl(profile.avatar_url, profile.equipped_avatar_id)}
          onClose={() => setChatOpen(false)}
        />
      )}
      <Toast message={message} />
    </div>
  );
}
