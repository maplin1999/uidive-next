"use client";

import { useState } from "react";
import { UserCog, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { CERT_OPTIONS } from "@/lib/auth-types";
import { updateProfile, uploadAvatar } from "@/lib/profile";
import { diverCertRingClass } from "@/lib/diverRing";

// Migrated from #edit-profile-modal (handleProfileEditSubmit()).
export function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { user, refreshProfile } = useAuth();
  const [cert, setCert] = useState(user?.cert || CERT_OPTIONS[0]);
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  function handleAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview((ev.target?.result as string) || "");
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      let avatarUrl = user!.avatar;
      if (avatarFile) {
        try {
          avatarUrl = await uploadAvatar(user!.id, avatarFile);
        } catch (err) {
          console.error("Could not upload photo:", err);
          setError(err instanceof Error ? `Could not upload photo: ${err.message}` : "Could not upload photo.");
          setSaving(false);
          return;
        }
      }
      await updateProfile(user!.id, {
        cert,
        location: location.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
      });
      await refreshProfile();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Could not save your profile -- please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <UserCog className="w-4 h-4 text-cyan-400" /> Edit Profile
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

        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarPreview}
            alt="Your profile photo"
            className={`w-16 h-16 rounded-full object-cover border-2 shrink-0 ${diverCertRingClass(cert)}`}
          />
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarSelected}
              className="text-xs text-slate-300 w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-slate-950 file:font-bold file:text-xs"
            />
          </div>
        </div>

        <p className="text-[10.5px] text-slate-500 leading-relaxed -mt-1">
          Your name is set from your account and can&apos;t be changed here. Update your photo,
          certification, location, and bio below.
        </p>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Certification
          </label>
          <select
            value={cert}
            onChange={(e) => setCert(e.target.value)}
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
          >
            {CERT_OPTIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Sydney, NSW"
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            rows={3}
            maxLength={200}
            placeholder="Tell other divers about yourself…"
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
