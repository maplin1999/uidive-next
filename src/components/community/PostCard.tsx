"use client";

import { useState } from "react";
import { Heart, MessageCircle, MapPin, ChevronRight } from "lucide-react";
import { CommunityPost, PostComment } from "@/lib/posts";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=300&q=80";

// Migrated from renderRealPosts()'s per-post template string in app.js.
// Liking, commenting, and "Post Log" are stubbed via onRequireAuth (sign-in
// isn't migrated yet) -- same pattern as the Home page's trip-card stubs.
export function PostCard({
  post,
  comments,
  onBookTrip,
  onRequireAuth,
}: {
  post: CommunityPost;
  comments: PostComment[];
  onBookTrip: (tripId: string) => void;
  onRequireAuth: (message: string) => void;
}) {
  const [commentDraft, setCommentDraft] = useState("");
  const author = post.profiles || { name: "A diver", avatar_url: "", cert: "" };
  const when = new Date(post.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const bookBtn = post.trip_id ? (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onBookTrip(post.trip_id!);
      }}
      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow-md shrink-0"
    >
      <span>Book Site</span>
      <ChevronRight className="w-4 h-4" />
    </button>
  ) : null;

  function submitComment() {
    if (!commentDraft.trim()) return;
    onRequireAuth("Sign in to post a comment.");
  }

  return (
    <article className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote
              Supabase Storage URLs; see TripCard.tsx for the same note. */}
          <img
            src={author.avatar_url || DEFAULT_AVATAR}
            alt={author.name}
            className="w-10 h-10 rounded-full object-cover border border-cyan-400/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100 hover:underline">{author.name}</h4>
              {author.cert && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  {author.cert}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Posted {when}</p>
          </div>
        </div>
      </div>

      {post.image_url && (
        <div className="relative rounded-2xl overflow-hidden max-h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          {post.location_name && (
            <div className="absolute bottom-4 left-4 right-4 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3 min-w-0">
                <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
                <p className="text-sm font-extrabold text-white truncate">{post.location_name}</p>
              </div>
              {bookBtn}
            </div>
          )}
        </div>
      )}

      {post.location_name && !post.image_url && (
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> {post.location_name}
          </p>
          {bookBtn}
        </div>
      )}

      <div className="flex items-center justify-between text-slate-400 text-xs pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => onRequireAuth("Sign in to like this post.")}
            className="flex items-center space-x-1.5 hover:text-rose-400 transition-colors"
          >
            <Heart className="w-5 h-5" />
            <span className="font-bold text-slate-200">{post.likes}</span>
          </button>
          <span className="flex items-center space-x-1.5">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold text-slate-200">{comments.length}</span>
          </span>
        </div>
        {post.corals_awarded && (
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 shrink-0">
            +10 🪸 Corals Earned
          </span>
        )}
      </div>

      <div className="space-y-3 text-xs px-1">
        {post.caption && (
          <p className="text-slate-400 pl-3">
            <strong className="font-bold text-slate-200">{author.name}:</strong> {post.caption}
          </p>
        )}
        {comments.length > 0 && (
          <div className="space-y-2 pl-3 border-l-2 border-slate-800">
            {comments.map((c) => (
              <p key={c.id} className="text-slate-400">
                <strong className="font-bold text-slate-200">
                  {c.profiles?.name || "A diver"}:
                </strong>{" "}
                {c.content}
              </p>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="text"
            value={commentDraft}
            onChange={(e) => setCommentDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitComment();
            }}
            placeholder="Write a comment... (Press Enter)"
            className="bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-slate-800 flex-1 focus:outline-none focus:border-cyan-500/50 text-slate-200"
          />
          <button
            onClick={submitComment}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-3 py-2.5 rounded-xl text-xs shrink-0"
          >
            Post
          </button>
        </div>
      </div>
    </article>
  );
}
