"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import {
  CommunityPost,
  PostComment,
  fetchCommunityPosts,
  fetchMyLikedPostIds,
  toggleLike,
  submitComment,
  deletePost,
} from "@/lib/posts";
import { DiveTrip, HostReviewStats, effectiveTripRating, fetchTrips } from "@/lib/trips";
import { PostCard } from "@/components/community/PostCard";
import { PostFormModal } from "@/components/community/PostFormModal";
import { DiveDetailModal } from "@/components/home/DiveDetailModal";
import { useToast, Toast } from "@/components/Toast";
import { CoralsCelebration } from "@/components/CoralsCelebration";
import { useAuth } from "@/components/auth/AuthContext";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// The Community tab (#tab-community in the old site): the Diver Feed.
// Posting, liking, and commenting are all real now (create_post/
// toggle_post_like/post_comments) -- gated by requireAuth() same as the old
// site. "Book Site" opens the real trip detail/booking modal when a post is
// linked to an actual bookable trip.
export default function CommunityPage() {
  return (
    <Suspense fallback={null}>
      <CommunityFeed />
    </Suspense>
  );
}

function CommunityFeed() {
  const searchParams = useSearchParams();
  const highlightPostId = searchParams.get("post");
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Map<string, PostComment[]>>(new Map());
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const [trips, setTrips] = useState<DiveTrip[]>([]);
  const [reviewStats, setReviewStats] = useState<Record<string, { avg_rating: number; review_count: number }>>({});
  const [hostReviewStats, setHostReviewStats] = useState<Record<string, HostReviewStats>>({});
  const [selectedTrip, setSelectedTrip] = useState<DiveTrip | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [deletingPost, setDeletingPost] = useState<CommunityPost | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { message, showToast } = useToast();
  const { user, requireAuth } = useAuth();

  const load = useCallback(() => {
    fetchCommunityPosts(user?.id)
      .then(async ({ posts, commentsByPost }) => {
        setPosts(posts);
        setCommentsByPost(commentsByPost);
        if (user) {
          const liked = await fetchMyLikedPostIds(
            user.id,
            posts.map((p) => p.id)
          );
          setLikedPostIds(liked);
        }
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load posts:", err);
        setStatus("error");
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchTrips()
      .then(({ trips, tripReviewStatsById, hostReviewStatsById }) => {
        setTrips(trips);
        setReviewStats(tripReviewStatsById);
        setHostReviewStats(hostReviewStatsById);
      })
      .catch((err) => console.error("Could not load trips for Community:", err));
  }, []);

  // Jump to and briefly highlight a specific post -- used when arriving here
  // from a dive-log tile on the Profile tab or a public profile's grid
  // (goToCommunityPost() in the old site).
  useEffect(() => {
    if (!highlightPostId || status !== "ready") return;
    const el = document.getElementById(`post-${highlightPostId}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedId(highlightPostId);
    const timer = setTimeout(() => setHighlightedId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightPostId, status]);

  async function handleToggleLike(post: CommunityPost) {
    const wasLiked = likedPostIds.has(post.id);
    // Optimistic update, same spirit as the old site's immediate UI flip.
    setLikedPostIds((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(post.id) : next.add(post.id);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === post.id ? { ...p, likes: p.likes + (wasLiked ? -1 : 1) } : p))
    );
    try {
      const { liked, likesCount } = await toggleLike(post.id);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, likes: likesCount } : p)));
      setLikedPostIds((prev) => {
        const next = new Set(prev);
        liked ? next.add(post.id) : next.delete(post.id);
        return next;
      });
    } catch (err) {
      console.error("Could not toggle like:", err);
      load();
    }
  }

  async function handleSubmitComment(post: CommunityPost, content: string) {
    if (!user) return;
    try {
      const comment = await submitComment(post.id, user.id, content);
      setCommentsByPost((prev) => {
        const next = new Map(prev);
        next.set(post.id, [...(next.get(post.id) || []), comment]);
        return next;
      });
    } catch (err) {
      console.error("Could not post comment:", err);
      showToast("Could not post your comment -- please try again.");
    }
  }

  async function handleConfirmDelete() {
    if (!deletingPost) return;
    setDeletingBusy(true);
    try {
      await deletePost(deletingPost.id);
      setPosts((prev) => prev.filter((p) => p.id !== deletingPost.id));
      setDeletingPost(null);
    } catch (err) {
      console.error("Could not delete post:", err);
      showToast("Could not delete that post -- please try again.");
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-3xl border border-slate-800">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-white">Diver Feed</h1>
            <p className="text-xs text-slate-400">
              Photos, videos, and condition logs from local divers
            </p>
          </div>
          <button
            onClick={() => {
              if (!requireAuth()) return;
              setEditingPost(null);
              setFormOpen(true);
            }}
            className="w-full sm:w-auto shrink-0 whitespace-nowrap bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Post Log</span>
          </button>
        </div>

        {status === "loading" && (
          <div className="space-y-6">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4 animate-pulse"
                aria-hidden="true"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800/60" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-slate-800/60 rounded" />
                    <div className="h-2.5 w-16 bg-slate-800/40 rounded" />
                  </div>
                </div>
                <div className="h-48 bg-slate-800/40 rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <p className="text-sm text-rose-400 text-center py-8">
            Could not load the feed -- please refresh.
          </p>
        )}

        {status === "ready" && posts.length === 0 && (
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <div className="text-3xl">🤿</div>
            <p className="text-sm font-bold text-slate-300">No posts yet</p>
            <p className="text-xs text-slate-500">
              Be the first to share a dive log or photo with the community.
            </p>
          </div>
        )}

        {status === "ready" && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className={`rounded-3xl transition-all duration-500 ${
                  highlightedId === post.id ? "ring-2 ring-cyan-500/60" : ""
                }`}
              >
                <PostCard
                  post={post}
                  comments={commentsByPost.get(post.id) || []}
                  liked={likedPostIds.has(post.id)}
                  isOwnPost={!!user && user.id === post.user_id}
                  onToggleLike={() => handleToggleLike(post)}
                  onSubmitComment={(content) => handleSubmitComment(post, content)}
                  onBookTrip={(tripId) => {
                    const trip = trips.find((t) => t.id === tripId);
                    if (trip) setSelectedTrip(trip);
                    else showToast("Could not find that dive trip -- try refreshing.");
                  }}
                  onEdit={() => {
                    setEditingPost(post);
                    setFormOpen(true);
                  }}
                  onDelete={() => setDeletingPost(post)}
                  onRequireAuth={() => requireAuth()}
                  onBlocked={load}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <PostFormModal
          trips={trips}
          editingPost={editingPost}
          onClose={() => setFormOpen(false)}
          onSaved={({ coralsAwarded }) => {
            setFormOpen(false);
            load();
            if (coralsAwarded) setCelebrating(true);
            else showToast(editingPost ? "✅ Dive log updated!" : "📸 Dive log posted!");
          }}
        />
      )}

      {celebrating && (
        <CoralsCelebration amount={10} title="🎉 Dive Log Posted!" onDone={() => setCelebrating(false)} />
      )}

      {selectedTrip && (
        <DiveDetailModal
          trip={selectedTrip}
          rating={effectiveTripRating(selectedTrip, reviewStats)}
          hostStats={selectedTrip.host_id ? hostReviewStats[selectedTrip.host_id] || null : null}
          onClose={() => setSelectedTrip(null)}
        />
      )}

      {deletingPost && (
        <ConfirmModal
          title="Delete this dive log?"
          message="This can't be undone."
          confirmLabel="Delete"
          confirming={deletingBusy}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingPost(null)}
        />
      )}

      <Toast message={message} />
    </main>
  );
}
