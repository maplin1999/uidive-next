"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send, Users } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { TripChatMessage, fetchTripChatMessages, sendTripChatMessage } from "@/lib/inbox";
import { resolveAvatarUrl } from "@/lib/cosmetics";

// Migrated from the old site's #trip-chat-modal -- a shared group chat among
// co-divers on a trip (no separate host-led channel; everyone with a
// confirmed booking is in the same room). Same 3s-poll pattern as the DM
// ChatModal.
export function TripChatModal({
  tripId,
  tripTitle,
  onClose,
}: {
  tripId: string;
  tripTitle: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TripChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      setMessages(await fetchTripChatMessages(tripId));
    } catch (err) {
      console.error("Could not load trip chat messages:", err);
    }
  }, [tripId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  if (!user) return null;

  async function handleSend() {
    const text = input.trim();
    if (!text || !user) return;
    setInput("");
    setSending(true);
    try {
      await sendTripChatMessage(tripId, user.id, text);
      await load();
    } catch (err) {
      console.error("Could not send trip chat message:", err);
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col h-[500px] max-h-[85dvh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
            <h3 className="font-bold text-white text-base truncate">{tripTitle}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={boxRef} className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1 text-xs pt-3">
          {messages.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">Say hi to your fellow divers 👋</p>
          )}
          {messages.map((m, i) => {
            const isYou = m.user_id === user.id;
            const senderName = isYou ? "You" : m.profiles?.name || "Diver";
            const avatarUrl = isYou
              ? resolveAvatarUrl(user.avatar, user.equipped_avatar_id)
              : resolveAvatarUrl(m.profiles?.avatar_url, m.profiles?.equipped_avatar_id);
            return isYou ? (
              <div key={i} className="flex justify-end">
                <div className="bg-cyan-500 text-slate-950 px-4 py-2.5 rounded-2xl rounded-br-md max-w-[75%] shadow-md">
                  <p className="font-semibold text-xs leading-relaxed">{m.content}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-end gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                <div className="bg-slate-800 text-slate-200 border border-slate-700/80 px-4 py-2.5 rounded-2xl rounded-bl-md max-w-[75%] shadow-md space-y-0.5">
                  <p className="font-extrabold text-[10px] text-cyan-400 uppercase tracking-wider">
                    {senderName}
                  </p>
                  <p className="font-normal text-xs leading-relaxed">{m.content}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 pt-2 border-t border-slate-800 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Message everyone on this trip…"
            className="bg-slate-950 text-xs px-4 py-2.5 rounded-xl border border-slate-800 flex-1 focus:outline-none focus:border-cyan-500 text-slate-200"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1 transition-colors shrink-0"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
