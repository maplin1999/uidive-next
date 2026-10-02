"use client";

import { useRef, useState } from "react";
import {
  Heart,
  MessageCircle,
  MapPin,
  ChevronRight,
  MoreVertical,
  Pencil,
  Trash2,
  Flag,
  Ban,
  Maximize2,
} from "lucide-react";
import { CommunityPost, PostComment } from "@/lib/posts";
import { useSocial } from "@/components/social/SocialContext";
import { toggleBlockUser } from "@/lib/social";
import { ImageLightbox } from "@/components/ImageLightbox";
import { DiverAvatar } from "@/components/DiverAvatar";
import { useClickOutside } from "@/lib/useClickOutside";

// Migrated from renderRealPosts()'s per-post template string in app.js.
// Liking and commenting are now real (toggle_post_like RPC, post_comments
// insert); the post owner also gets an Edit/Delete menu, migrated from
// togglePostMenu()/deletePost().
export function PostCard({
  post,
  comments,
  liked,
  isOwnPost,
  onToggleLike,
  onSubmitComment,
  onBookTrip,
  onEdit,
  onDelete,
  onRequireAuth,
  onBlocked,
}: {
  post: CommunityPost;
  comments: PostComment[];
  liked: boolean;
  isOwnPost: boolean;
  onToggleLike: () => void;
  onSubmitComment: (content: string) => void;
  onBookTrip: (tripId: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onRequireAuth: () => boolean;
  onBlocked?: () => void;
}) {
  const [commentDraft, setCommentDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setMenuOpen(false));
  const { openProfile, openReport } = useSocial();
  const author = post.profiles || { name: "A diver", avatar_url: "", cert: "", equipped_avatar_id: null };
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

  function handleLikeClick() {
    if (!onRequireAuth()) return;
    onToggleLike();
  }

  function submitComment() {
    if (!commentDraft.trim()) return;
    if (!onRequireAuth()) return;
    onSubmitComment(commentDraft.trim());
    setCommentDraft("");
  }

  return (
    <article className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5 transition-all">
      <div className="flex items-center justify-between">
        <button
          onClick={() => openProfile(post.user_id)}
          className="flex items-center space-x-3 text-left"
        >
          <DiverAvatar
            avatarUrl={author.avatar_url}
            equippedAvatarId={author.equipped_avatar_id}
            cert={author.cert}
            sizeClass="w-10 h-10"
            alt={author.name}
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
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-7 h-7 rounded-full text-slate-500 hover:text-slate-300 hover:bg-slate-800 flex items-center justify-center transition-colors"
            aria-label="Post options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 z-30 text-left">
              {isOwnPost ? (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      if (!onRequireAuth()) return;
                      openReport("post", post.id, "Post");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <Flag className="w-3.5 h-3.5" /> Report post
                  </button>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      if (!onRequireAuth()) return;
                      const firstName = author.name.split(" ")[0];
                      if (
                        !window.confirm(
                          `Block ${firstName}? You won't see their posts or comments, and they won't be able to message you. You can unblock them later.`
                        )
                      )
                        return;
                      try {
                        await toggleBlockUser(post.user_id);
                        onBlocked?.();
                      } catch (err) {
                        console.error("Could not block user:", err);
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                  >
                    <Ban className="w-3.5 h-3.5" /> Block user
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {post.image_url && (
        // always-dark: this whole region sits on top of a photo, so its
        // glass chips (expand icon, location/Book Site bar) need to stay
        // dark-chrome-on-photo in both themes rather than flipping to
        // light-mode's page-background colors -- same treatment as the
        // corals-earned badge and caption overlay elsewhere (PublicProfileModal,
        // profile dive-log grid). Without it, light mode's generic
        // ".text-white" override turned the expand icon almost the same
        // color as its own dark circle, making it nearly invisible.
        <div className="always-dark relative rounded-2xl overflow-hidden max-h-96">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={() => setLightboxOpen(true)}
              aria-label="View full-size photo"
              className="w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
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
            onClick={handleLikeClick}
            className={`flex items-center space-x-1.5 transition-colors ${
              liked ? "text-rose-400" : "hover:text-rose-400"
            }`}
          >
            <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
            <span className="font-bold text-slate-200">{post.likes}</span>
          </button>
          <span className="flex items-center space-x-1.5">
            <MessageCircle className="w-5 h-5" />
            <span className="font-bold text-slate-200">{comments.length}</span>
          </span>
        </div>
        {post.corals_awarded && (
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 shrink-0">
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
              <div key={c.id} className="flex items-start justify-between gap-2">
                <p className="text-slate-400">
                  <strong className="font-bold text-slate-200">
                    {c.profiles?.name || "A diver"}:
                  </strong>{" "}
                  {c.content}
                </p>
                <button
                  onClick={() => {
                    if (!onRequireAuth()) return;
                    openReport("comment", c.id, "comment");
                  }}
                  aria-label="Report comment"
                  className="text-slate-600 hover:text-rose-400 transition-colors shrink-0 mt-0.5"
                >
                  <Flag className="w-3 h-3" />
                </button>
              </div>
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

      {lightboxOpen && <ImageLightbox src={post.image_url} onClose={() => setLightboxOpen(false)} />}
    </article>
  );
}
