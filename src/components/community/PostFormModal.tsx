"use client";

import { useState } from "react";
import { X, Camera, Pencil, MapPin } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { DiveTrip } from "@/lib/trips";
import { createPost, updatePost, uploadPostImage } from "@/lib/posts";

const CUSTOM_LOCATION = "__custom__";

// Only the fields this form actually reads/writes -- deliberately narrower
// than the full CommunityPost (Community feed) or MyPost (own-profile dive
// logs) shapes so this modal can edit a post from either page without
// either page needing to pad its post objects with fields it doesn't have.
export interface EditablePost {
  id: string;
  caption: string;
  image_url: string;
  location_name: string;
  trip_id: string | null;
}

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
  editingPost?: EditablePost | null;
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
    if (!user) return;
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
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            {isEditing ? (
              <Pencil className="w-4 h-4 text-cyan-400" />
            ) : (
              <Camera className="w-4 h-4 text-cyan-400" />
            )}
            {isEditing ? "Edit Dive Log" : "Post a Dive Log"}
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

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Location (optional)
          </label>
          <div className="flex items-center space-x-3 px-3.5 py-3 bg-slate-950 rounded-xl border border-slate-800 focus-within:border-cyan-500">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={locationSelect}
              onChange={(e) => setLocationSelect(e.target.value)}
              className="bg-transparent text-sm w-full focus:outline-none text-slate-200 [color-scheme:dark]"
            >
              <option value="">No location tag</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.location} — {t.title}
                </option>
              ))}
              <option value={CUSTOM_LOCATION}>Somewhere else…</option>
            </select>
          </div>
          {locationSelect === CUSTOM_LOCATION && (
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="e.g. Bondi, Sydney"
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Caption
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 280))}
            rows={3}
            maxLength={280}
            placeholder="What did you see down there?"
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelected(e.target.files?.[0])}
            className="text-xs text-slate-300 w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-slate-950 file:font-bold file:text-xs"
          />
          {imagePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreview}
              alt="Selected dive photo preview"
              className="w-full h-40 object-cover rounded-xl border border-slate-800 mt-2"
            />
          )}
          {imagePreview && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-[10px] font-bold text-rose-400 hover:text-rose-300"
              >
                Remove photo
              </button>
            </div>
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
