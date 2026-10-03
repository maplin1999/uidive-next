"use client";

import { useEffect, useState } from "react";
import { X, MessageSquare, Users } from "lucide-react";
import { Buddy, fetchBuddiesList } from "@/lib/social";
import { resolveAvatarUrl } from "@/lib/cosmetics";
import { useSocial } from "@/components/social/SocialContext";
import { ChatModal } from "@/components/inbox/ChatModal";
import { DiverAvatar } from "@/components/DiverAvatar";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useLocale } from "@/components/i18n/LocaleContext";

// Migrated from the old site's #buddies-list-modal (openBuddiesListModal()/
// renderMyBuddies()) -- the Instagram-style "who's on your buddies list"
// view reached from the profile page's Buddies stat tile. Cosmetics
// (equipped avatar ring/calling card) are left out, same as everywhere else
// in this rewrite.
export function BuddiesListModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const { t } = useLocale();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [chatWith, setChatWith] = useState<Buddy | null>(null);
  const { openProfile } = useSocial();

  useEffect(() => {
    setStatus("loading");
    fetchBuddiesList(userId)
      .then((list) => {
        setBuddies(list);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load buddies list:", err);
        setStatus("error");
      });
  }, [userId]);

  useEscapeClose(onClose);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" /> {t.buddiesListModal.title}
          </h3>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto pt-2 space-y-1 -mx-1 px-1">
          {status === "loading" && (
            <p className="text-xs text-slate-500 text-center py-10">{t.buddiesListModal.loading}</p>
          )}
          {status === "error" && (
            <p className="text-xs text-rose-400 text-center py-10">{t.buddiesListModal.loadError}</p>
          )}
          {status === "ready" && buddies.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-10">
              {t.buddiesListModal.noBuddiesYet}
            </p>
          )}
          {status === "ready" &&
            buddies.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-2xl hover:bg-slate-800/60 transition-colors"
              >
                <button
                  onClick={() => {
                    onClose();
                    openProfile(b.id);
                  }}
                  className="flex items-center space-x-3 min-w-0 text-left flex-1"
                >
                  <DiverAvatar
                    avatarUrl={b.avatar_url}
                    equippedAvatarId={b.equipped_avatar_id}
                    cert={b.cert}
                    sizeClass="w-10 h-10"
                    alt={b.name}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{b.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{b.cert}</p>
                  </div>
                </button>
                <button
                  onClick={() => setChatWith(b)}
                  className="shrink-0 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold px-3 py-2 rounded-xl text-[10px] flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> {t.buddiesListModal.chat}
                </button>
              </div>
            ))}
        </div>
      </div>

      {chatWith && (
        <ChatModal
          partnerId={chatWith.id}
          partnerName={chatWith.name}
          partnerAvatar={resolveAvatarUrl(chatWith.avatar_url, chatWith.equipped_avatar_id)}
          onClose={() => setChatWith(null)}
        />
      )}
    </div>
  );
}
