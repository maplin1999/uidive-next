"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Send } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { DEFAULT_AVATAR } from "@/lib/auth-types";
import { DirectMessage, fetchMessages, sendMessage, markMessagesRead } from "@/lib/inbox";

// Migrated from the old site's #chat-modal (openChatModal() for a real buddy
// conversation). Simple 3s polling rather than a realtime subscription --
// good enough for a modal that's only open while actively being looked at.
export function ChatModal({
  partnerId,
  partnerName,
  partnerAvatar,
  onClose,
  onMessagesChanged,
}: {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  onClose: () => void;
  onMessagesChanged?: () => void;
}) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const msgs = await fetchMessages(user.id, partnerId);
      setMessages(msgs);
      await markMessagesRead(user.id, partnerId);
      onMessagesChanged?.();
    } catch (err) {
      console.error("Could not load messages:", err);
    }
  }, [user, partnerId, onMessagesChanged]);

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
      await sendMessage(user.id, partnerId, text);
      await load();
    } catch (err) {
      console.error("Could not send message:", err);
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl flex flex-col shadow-2xl max-h-[85vh]">
        <div className="flex justify-between items-center border-b border-slate-800 px-5 py-3.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={partnerAvatar || DEFAULT_AVATAR}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <h3 className="font-bold text-white text-sm truncate">{partnerName}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={boxRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[300px]">
          {messages.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">Say hi to {partnerName} 👋</p>
          )}
          {messages.map((m, i) => {
            const isYou = m.sender_id === user.id;
            const timeStr = new Date(m.created_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            });
            return isYou ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[75%]">
                  <div className="bg-cyan-500 text-slate-950 px-4 py-2.5 rounded-2xl rounded-br-md shadow-md">
                    <p className="font-semibold text-xs leading-relaxed">{m.content}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 text-right">{timeStr}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-end gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partnerAvatar || DEFAULT_AVATAR}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover shrink-0"
                />
                <div className="max-w-[75%]">
                  <div className="bg-slate-800 text-slate-200 border border-slate-700/80 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-md">
                    <p className="font-normal text-xs leading-relaxed">{m.content}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">{timeStr}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-800 p-3 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Type a message…"
            className="flex-1 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
