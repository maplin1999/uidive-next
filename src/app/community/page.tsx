"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { CommunityPost, PostComment, fetchCommunityPosts } from "@/lib/posts";
import { PostCard } from "@/components/community/PostCard";
import { useToast, Toast } from "@/components/Toast";
import { useAuth } from "@/components/auth/AuthContext";

// The Community tab (#tab-community in the old site): the Diver Feed.
// Posting, liking, and commenting all require a signed-in user in the old
// site (requireAuth() gates every one of them) -- now a real gate via
// useAuth()'s requireAuth(), which opens the actual sign-in modal. The
// underlying actions themselves (creating a post, liking, commenting) are
// still stubbed with a toast once signed in, since post creation/likes
// haven't been wired up yet -- reading the feed needs no sign-in at all
// (posts/post_comments are both publicly readable), so that part is fully
// real, live Supabase data.
export default function CommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Map<string, PostComment[]>>(new Map());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const { message, showToast } = useToast();
  const { requireAuth } = useAuth();

  useEffect(() => {
    let cancelled = false;
    fetchCommunityPosts()
      .then(({ posts, commentsByPost }) => {
        if (cancelled) return;
        setPosts(posts);
        setCommentsByPost(commentsByPost);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load posts:", err);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
              showToast("Posting a dive log is coming in a future update.");
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
              <PostCard
                key={post.id}
                post={post}
                comments={commentsByPost.get(post.id) || []}
                onBookTrip={() =>
                  showToast("🤿 Trip details are coming in a future update.")
                }
                onRequireAuth={() => {
                  if (!requireAuth()) return;
                  showToast("That's coming in a future update.");
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Toast message={message} />
    </main>
  );
}
