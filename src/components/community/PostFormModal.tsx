"use client";

import { useState } from "react";
import { X, Image as ImageIcon, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { DiveTrip } from "@/lib/trips";
import { CommunityPost, createPost, updatePost, uploadPostImage } from "@/lib/posts";

const CUSTOM_LOCATION = "__custom__";

// Migrated from the old site's #post-log-modal (openPostLogModal()/
// openEditPostModal()/handlePostSubmit()). The old site's drag-to-crop tool
// for the attached photo is left out -- a real simplification, same as the
// native date/time inputs elsewhere -- the photo is uploaded as picked.
export function PostFormModal({
  trips,
  editingPost,
  onClose,
  onSaved,
}: {
  trips: DiveTrip[];
  editingPost?: CommunityPost | null;
  onClose: () => void;
  onSaved: (opts: { coralsAwarded: boolean }) => void;
}) {
  const { user } = useAuth();
  const isEditing = !!editingPost;

  const initialLocationSelect = editingPost?.trip_id
    ? editingPost.trip_id
    : editingPost?.location_name
      ? CUSTOM_LOCATION
      : "";

  const [caption, setCaption] = useState(editingPost?.caption || "");
  const [locationSelect, setLocationSelect] = useState(initialLocationSelect);
  const [customLocation, setCustomLocation] = useState(
    initialLocationSelect === CUSTOM_LOCATION ? editingPost?.location_name || "" : ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editingPost?.image_url || "");
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  function handleImageSelected(file: File | undefined) {
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview("");
    setRemoveImage(true);
  }

  async function handleSubmit() {
    const trimmedCaption = caption.trim();
    if (!trimmedCaption && !imageFile && !imagePreview) {
      setError("Add a caption or a photo before posting.");
      return;
    }

    let locationName = "";
    let tripId: string | null = null;
    if (locationSelect === CUSTOM_LOCATION) {
      locationName = customLocation.trim();
    } else if (locationSelect) {
      const trip = trips.find((t) => t.id === locationSelect);
      if (trip) {
        locationName = trip.location;
        tripId = trip.id;
      }
    }

    setSubmitting(true);
    setError("");
    try {
      let imageUrl = isEditing && !removeImage ? editingPost!.image_url : "";
      if (imageFile) {
        imageUrl = await uploadPostImage(user.id, imageFile);
      }

      if (isEditing) {
        await updatePost(editingPost!.id, {
          caption: trimmedCaption,
          imageUrl,
          locationName,
          tripId,
        });
        onSaved({ coralsAwarded: false });
      } else {
        const result = await createPost({
          caption: trimmedCaption,
          imageUrl,
          locationName,
          tripId,
        });
        onSaved({ coralsAwarded: result.coralsAwarded });
      }
    } catch (err) {
      console.error("Could not save post:", err);
      setError(err instanceof Error ? err.message : "Could not save your post -- please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <h3 className="font-bold text-white text-base">
            {isEditing ? "Edit Dive Log" : "Share a Dive Log"}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          placeholder="How was the dive? What did you see?"
          className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
        />

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Location
          </label>
          <select
            value={locationSelect}
            onChange={(e) => setLocationSelect(e.target.value)}
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
          >
            <option value="">No location</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.location} — {t.title}
              </option>
            ))}
            <option value={CUSTOM_LOCATION}>Custom location…</option>
          </select>
          {locationSelect === CUSTOM_LOCATION && (
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Where was this?"
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Photo (optional)
          </label>
          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="" className="w-full h-40 object-cover" />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-950/90"
                aria-label="Remove photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-dashed border-slate-700 text-slate-400 hover:border-cyan-500/40 cursor-pointer transition-colors">
              <ImageIcon className="w-4 h-4" />
              <span className="text-xs font-semibold">Choose a photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageSelected(e.target.files?.[0])}
                className="hidden"
              />
            </label>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          {submitting ? (isEditing ? "Saving…" : "Posting…") : isEditing ? "Save Changes" : "Share Post"}
        </button>
      </div>
    </div>
  );
}
