"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast, Toast } from "@/components/Toast";
import { CosmeticThumbnail } from "@/components/CosmeticThumbnail";
import {
  COSMETIC_CATALOG,
  COSMETIC_TIER_STYLES,
  CosmeticType,
  equipCosmetic,
  unequipCosmetic,
  fetchMyCosmetics,
} from "@/lib/cosmetics";

// Ported from the old site's #cosmetics-locker-modal / renderCosmeticsLocker()
// -- "My Locker", opened from the Dive Shop. Shows every catalog item split
// into two grids (Avatars, Calling Cards); owned-but-not-equipped items get
// an Equip button, the equipped one gets a disabled "Equipped" pill, and
// anything not owned renders grayscale/dimmed with "Locked".
export function CosmeticsLockerModal({ onClose }: { onClose: () => void }) {
  const { user, refreshProfile } = useAuth();
  const { message, showToast } = useToast();
  const [ownedIds, setOwnedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchMyCosmetics(user.id)
      .then((ids) => {
        setOwnedIds(ids);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load your cosmetics:", err);
        setStatus("error");
      });
  }, [user]);

  if (!user) return null;

  async function handleEquip(itemId: string) {
    setBusyId(itemId);
    try {
      await equipCosmetic(itemId);
      await refreshProfile();
      showToast(`✅ Equipped ${COSMETIC_CATALOG[itemId].name}.`);
    } catch (err) {
      console.error("Could not equip that item:", err);
      showToast("❌ Could not equip that item -- please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUnequip(type: CosmeticType) {
    setBusyId(type);
    try {
      await unequipCosmetic(type);
      await refreshProfile();
    } catch (err) {
      console.error("Could not unequip that item:", err);
      showToast("❌ Could not unequip that item -- please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const entries = Object.entries(COSMETIC_CATALOG);
  const avatars = entries.filter(([, item]) => item.type === "avatar");
  const cards = entries.filter(([, item]) => item.type === "calling_card");

  function renderGrid(items: [string, (typeof COSMETIC_CATALOG)[string]][]) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {items.map(([id, item]) => {
          const owned = ownedIds.has(id);
          const equipped =
            item.type === "avatar"
              ? user?.equipped_avatar_id === id
              : user?.equipped_calling_card_id === id;
          const tierStyle = COSMETIC_TIER_STYLES[item.tier];
          const thumbSizeClass = item.type === "avatar" ? "w-12 h-12 border-2" : "w-16 h-12 border-2";
          const shapeClass = item.type === "avatar" ? "rounded-full" : "rounded-lg";

          return (
            <div
              key={id}
              className={`p-3 rounded-2xl bg-slate-950 border text-center space-y-1.5 ${
                equipped ? "border-cyan-400" : "border-slate-800"
              } ${owned ? "" : "opacity-40 grayscale"}`}
            >
              <div className={`mx-auto ${thumbSizeClass} ${tierStyle.ring} ${shapeClass} overflow-hidden`}>
                <CosmeticThumbnail item={item} sizeClass="w-full h-full" />
              </div>
              <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
              <span
                className={`inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${tierStyle.chip}`}
              >
                {tierStyle.label}
              </span>
              <div>
                {!owned ? (
                  <span className="text-[9px] text-slate-500 font-bold uppercase">Locked</span>
                ) : equipped ? (
                  <button
                    onClick={() => handleUnequip(item.type)}
                    disabled={busyId === item.type}
                    className="text-[9px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full disabled:opacity-60"
                  >
                    Equipped
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquip(id)}
                    disabled={busyId === id}
                    className="text-[9px] font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded-full disabled:opacity-60"
                  >
                    Equip
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header sits outside the scrollable area (shrink-0, not part of
            the overflow-y-auto div below) so the close button always stays
            reachable without needing to be `sticky` -- that previously made
            the native scrollbar run the header's full height too, which
            looked wrong clipped against the rounded top corners. The outer
            card's own overflow-hidden + rounded-3xl now clips both the
            header's top corners and the scrollable content's bottom
            corners, so neither section needs its own rounded-t/b class. */}
        <div className="shrink-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <svg viewBox="0 0 512 512" fill="currentColor" className="w-4 h-4 text-purple-400 shrink-0">
              <path d="M385.723,84.402H126.277C56.647,84.402,0,141.05,0,210.679v216.919h259.446H512V210.679C512,141.05,455.352,84.402,385.723,84.402z M30.417,271.209h54.186v37.008h120.655v-37.008h54.186v47.777H30.417V271.209z M115.021,277.8v-43.598h59.82V277.8H115.021z M259.446,397.181H30.417v-47.777h229.029V397.181z M259.446,210.679v30.112H205.26v-37.008H84.604v37.008H30.417v-30.113c0-6.034,0.567-11.937,1.637-17.664h228.632C259.875,198.789,259.446,204.685,259.446,210.679z M43.376,162.596c16.621-28.547,47.556-47.778,82.901-47.778h177.341c-15.019,12.882-26.983,29.224-34.652,47.778H43.376z M481.583,397.181h-191.72V271.209h191.72V397.181z M481.583,240.792h-191.72V210.68c0-52.857,43.003-95.86,95.86-95.86c2.478,0,4.934,0.094,7.365,0.28c2.43,0.186,4.837,0.462,7.214,0.826c1.585,0.243,3.157,0.525,4.716,0.845c43.641,8.954,76.565,47.659,76.565,93.909V240.792z" />
              <path d="M385.723,135.097v30.417c24.905,0,45.164,20.261,45.164,45.164h30.417C461.305,169.003,427.399,135.097,385.723,135.097z" />
              <rect x="129.719" y="242.486" width="30.417" height="27.038" />
            </svg>{" "}
            My Locker
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">

        {status === "loading" && <p className="text-xs text-slate-500 text-center py-6">Loading…</p>}
        {status === "error" && (
          <p className="text-xs text-rose-400 text-center py-6">
            Could not load your Locker -- please try again.
          </p>
        )}
        {status === "ready" && (
          <>
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Avatars</h4>
              {renderGrid(avatars)}
            </div>
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Calling Cards</h4>
              {renderGrid(cards)}
            </div>
          </>
        )}
        </div>
      </div>
      <Toast message={message} />
    </div>
  );
}
