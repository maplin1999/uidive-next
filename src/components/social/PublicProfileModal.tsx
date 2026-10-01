"use client";

import { useEffect, useState } from "react";
import { X, Award, Grid, MapPin, MoreVertical, Flag, Ban, UserPlus, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useSocial } from "@/components/social/SocialContext";
import { DEFAULT_AVATAR } from "@/lib/auth-types";
import {
  PublicProfile,
  PublicPost,
  FriendshipStatus,
  fetchPublicProfile,
  fetchPublicProfilePosts,
  fetchBuddiesCount,
  fetchFriendshipStatus,
  isUserBlocked,
  toggleBlockUser,
} from "@/lib/social";
import { sendBuddyRequest } from "@/lib/inbox";
import { ChatModal } from "@/components/inbox/ChatModal";
import { diverCertRingClass } from "@/lib/diverRing";

// Migrated from the old site's #public-profile-modal (viewPublicProfile()).
// Cosmetics (equipped calling card/avatar ring) are left out, same as
// everywhere else in this rewrite.
export function PublicProfileModal() {
  const { user, requireAuth } = useAuth();
  const { profileUserId, closeProfile, openReport } = useSocial();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [buddiesCount, setBuddiesCount] = useState(0);
  const [friendship, setFriendship] = useState<FriendshipStatus>("none");
  const [blocked, setBlocked] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [menuOpen, setMenuOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!profileUserId) return;
    setStatus("loading");
    setMenuOpen(false);
    setRequestSent(false);
    Promise.all([
      fetchPublicProfile(profileUserId),
      fetchPublicProfilePosts(profileUserId),
      fetchBuddiesCount(profileUserId),
      user ? fetchFriendshipStatus(user.id, profileUserId) : Promise.resolve<FriendshipStatus>("none"),
      user ? isUserBlocked(user.id, profileUserId) : Promise.resolve(false),
    ])
      .then(([p, posts, count, fs, isBlocked]) => {
        setProfile(p);
        setPosts(posts);
        setBuddiesCount(count);
        setFriendship(fs);
        setBlocked(isBlocked);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load that profile:", err);
        setStatus("error");
      });
  }, [profileUserId, user]);

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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-5xl rounded-3xl p-5 sm:p-8 space-y-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start -mt-1 -mr-1">
          <div className="relative">
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
                  <div className="absolute left-0 top-full mt-1 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-10">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        openReport("user", profile.id, profile.name);
                      }}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Flag className="w-3.5 h-3.5" /> Report user
                    </button>
                    <button
                      onClick={handleToggleBlock}
                      className="w-full text-left px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
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
            <div className="relative overflow-hidden p-5 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 shadow-xl -mt-2">
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatar_url || DEFAULT_AVATAR}
                  alt=""
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 shadow-lg shrink-0 ${diverCertRingClass(
                    profile.cert
                  )}`}
                />
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-black text-white">{profile.name}</h2>
                  <p className="text-xs font-bold text-cyan-400 flex items-center justify-center sm:justify-start gap-1">
                    <Award className="w-4 h-4" />
                    {profile.location ? `${profile.cert} • ${profile.location}` : profile.cert}
                  </p>
                  {profile.bio && <p className="text-xs text-slate-400 max-w-md">{profile.bio}</p>}
                  <p className="text-[10px] font-mono font-bold text-slate-500">Diver ID: #{profile.diver_id}</p>

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

              <div className="relative z-10 grid grid-cols-3 gap-1.5 w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                <StatTile label="Dives" value={profile.dives} />
                <StatTile label="Buddies" value={buddiesCount} />
                <StatTile label="Corals" value={profile.corals} accent="amber" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid className="w-5 h-5 text-cyan-400" /> Dive Logs &amp; Photos
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
                    if (post.image_url) {
                      return (
                        <div
                          key={post.id}
                          className="relative group rounded-2xl overflow-hidden h-64 border border-slate-800 shadow-md bg-slate-800"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.image_url}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {post.corals_awarded && (
                            <span className="absolute top-2 left-2 text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-sm border border-amber-200/30">
                              +10 🪸
                            </span>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent p-4 flex flex-col justify-end">
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
                        className="relative rounded-2xl overflow-hidden h-64 border border-slate-800 shadow-md bg-slate-900 p-5 flex flex-col justify-between"
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
          partnerAvatar={profile.avatar_url}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: "amber" }) {
  return (
    <div
      className={`p-2 sm:p-2.5 bg-slate-950 rounded-2xl border text-center sm:min-w-[74px] ${
        accent === "amber" ? "border-amber-500/30" : "border-slate-800"
      }`}
    >
      <div className={`text-base sm:text-lg font-black ${accent === "amber" ? "text-amber-400" : "text-white"}`}>
        {value}
      </div>
      <div className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold">{label}</div>
    </div>
  );
}
