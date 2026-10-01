"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useSocial } from "@/components/social/SocialContext";
import { DEFAULT_AVATAR } from "@/lib/auth-types";
import {
  BuddyRequest,
  Buddy,
  Conversation,
  GroupChatTrip,
  fetchBuddyRequests,
  respondToBuddyRequest,
  fetchBuddies,
  fetchConversations,
  fetchMyGroupChats,
} from "@/lib/inbox";
import { AddBuddyModal } from "@/components/inbox/AddBuddyModal";
import { ChatModal } from "@/components/inbox/ChatModal";
import { TripChatModal } from "@/components/inbox/TripChatModal";
import { diverCertRingClass } from "@/lib/diverRing";

// The Inbox tab (#tab-inbox in the old site): buddy requests, direct
// messages with accepted buddies, and group chats for trips you're
// confirmed on -- all three stacked in one page, same as the old site
// (there's no tabbed switcher there). Everything here is real
// (friendships/messages/trip_chat_messages tables) -- cosmetics (equipped
// avatar rings on messages) are left out, same as everywhere else in this
// rewrite. The old site's "Add Buddy" lives inside its separate Dive
// Buddies list modal (opened from the profile header's Buddies tile) --
// since that tile instead routes here in this rewrite, the button is kept
// in the header so adding a buddy is still reachable.
export default function InboxPage() {
  const { user, requireAuth } = useAuth();
  const { openProfile } = useSocial();

  const [requests, setRequests] = useState<BuddyRequest[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChatTrip[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const [addBuddyOpen, setAddBuddyOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [activeGroupChat, setActiveGroupChat] = useState<{ id: string; title: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const [reqs, bud] = await Promise.all([fetchBuddyRequests(user.id), fetchBuddies(user.id)]);
      setRequests(reqs);
      setBuddies(bud);
      const [convos, groups] = await Promise.all([
        fetchConversations(user.id, bud),
        fetchMyGroupChats(user.id),
      ]);
      setConversations(convos);
      setGroupChats(groups);
      setStatus("ready");
    } catch (err) {
      console.error("Could not load Inbox:", err);
      setStatus("error");
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12">
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="text-3xl">📬</div>
          <h1 className="text-lg font-bold text-white">Sign in to view your Inbox</h1>
          <p className="text-xs text-slate-400">
            Buddy requests, messages, and trip group chats all live here.
          </p>
          <button
            onClick={() => requireAuth()}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  async function handleRespond(requestId: string, accept: boolean) {
    try {
      await respondToBuddyRequest(requestId, accept);
      await load();
    } catch (err) {
      console.error("Could not respond to buddy request:", err);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">Inbox</h1>
            <p className="text-xs text-slate-400">Buddy requests and messages, all in one place</p>
          </div>
          <button
            onClick={() => setAddBuddyOpen(true)}
            className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" /> Add Buddy
          </button>
        </div>

        {status === "loading" && <p className="text-xs text-slate-500 text-center py-10">Loading…</p>}
        {status === "error" && (
          <p className="text-xs text-rose-400 text-center py-10">
            Could not load your Inbox -- please refresh.
          </p>
        )}

        {/* BUDDY REQUESTS */}
        {status === "ready" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" /> Buddy Requests
            </h2>
            {requests.length === 0 && (
              <EmptyState emoji="📭" text="No pending buddy requests right now." />
            )}
            {requests.map((req) => {
              const person = req.profiles || {
                name: "A diver",
                avatar_url: "",
                cert: "",
                diver_id: "",
              };
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800"
                >
                  <button
                    onClick={() => openProfile(req.requester_id)}
                    className="flex items-center space-x-3 min-w-0 text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={person.avatar_url || DEFAULT_AVATAR}
                      alt=""
                      className={`w-10 h-10 rounded-full object-cover border-2 ${diverCertRingClass(person.cert)}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate hover:underline">{person.name}</p>
                      <p className="text-[11px] text-slate-500">wants to be your dive buddy</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRespond(req.id, true)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-[11px] transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-2 rounded-lg text-[11px] transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MESSAGES */}
        {status === "ready" && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" /> Messages
            </h2>
            {conversations.length === 0 && (
              <EmptyState
                emoji="💬"
                text="No conversations yet — start one from your Dive Buddies list."
              />
            )}
            {conversations.map((c) => (
              <div
                key={c.partner.id}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 hover:bg-slate-800/80 transition-colors border border-slate-800"
              >
                <button
                  onClick={() => openProfile(c.partner.id)}
                  className="flex items-center space-x-3 min-w-0 text-left shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.partner.avatar_url || DEFAULT_AVATAR}
                    alt=""
                    className={`w-9 h-9 rounded-full object-cover border-2 ${diverCertRingClass(c.partner.cert)}`}
                  />
                </button>
                <button
                  onClick={() =>
                    setActiveChat({ id: c.partner.id, name: c.partner.name, avatar: c.partner.avatar_url })
                  }
                  className="flex-1 flex items-center justify-between min-w-0 text-left ml-3"
                >
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{c.partner.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.lastMessage.sender_id === user.id ? `You: ${c.lastMessage.content}` : c.lastMessage.content}
                    </p>
                  </div>
                  {c.unread && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 ml-2" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TRIP GROUP CHATS */}
        {status === "ready" && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" /> Trip Group Chats
            </h2>
            {groupChats.length === 0 && (
              <EmptyState emoji="🤿" text="Book a trip to join its group chat with fellow divers." />
            )}
            {groupChats.map((trip) => {
              const dateStr = trip.scheduled_date
                ? new Date(trip.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "";
              const subtitle = [trip.location, dateStr].filter(Boolean).join(" • ");
              return (
                <button
                  key={trip.trip_id}
                  onClick={() => setActiveGroupChat({ id: trip.trip_id, title: trip.title })}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 hover:bg-slate-800/80 transition-colors border border-slate-800 text-left"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{trip.title}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{subtitle || "Group chat"}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {addBuddyOpen && <AddBuddyModal onClose={() => setAddBuddyOpen(false)} />}
      {activeChat && (
        <ChatModal
          partnerId={activeChat.id}
          partnerName={activeChat.name}
          partnerAvatar={activeChat.avatar}
          onClose={() => {
            setActiveChat(null);
            load();
          }}
          onMessagesChanged={load}
        />
      )}
      {activeGroupChat && (
        <TripChatModal
          tripId={activeGroupChat.id}
          tripTitle={activeGroupChat.title}
          onClose={() => setActiveGroupChat(null)}
        />
      )}
    </main>
  );
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
      <div className="text-3xl">{emoji}</div>
      <p className="text-xs text-slate-500">{text}</p>
    </div>
  );
}
