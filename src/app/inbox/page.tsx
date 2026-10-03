"use client";

import { useEffect, useState, useCallback } from "react";
import { UserPlus, Users, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useSocial } from "@/components/social/SocialContext";
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
import { DiverAvatar } from "@/components/DiverAvatar";
import { resolveAvatarUrl } from "@/lib/cosmetics";
import { useLocale } from "@/components/i18n/LocaleContext";

type InboxTab = "requests" | "messages" | "groups";

// The Inbox tab (#tab-inbox in the old site): buddy requests, direct
// messages with accepted buddies, and group chats for trips you're
// confirmed on. The old site stacks all three vertically with no switcher;
// this rewrite instead splits them into their own tabs (Requests/Messages/
// Group Chats, each with a badge count) since stacking got unwieldy once
// there was real content in all three sections at once -- a deliberate
// departure from the old site, not a missed-parity gap. Everything here is
// real (friendships/messages/trip_chat_messages tables), including equipped
// cosmetic avatars on requests/conversations. The old site's "Add Buddy"
// lives inside its separate Dive Buddies list modal (opened from the
// profile header's Buddies tile) -- since that tile instead routes here in
// this rewrite, the button is kept in the header so adding a buddy is still
// reachable.
export default function InboxPage() {
  const { user, requireAuth } = useAuth();
  const { openProfile } = useSocial();
  const { t } = useLocale();

  const [requests, setRequests] = useState<BuddyRequest[]>([]);
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [groupChats, setGroupChats] = useState<GroupChatTrip[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [activeTab, setActiveTab] = useState<InboxTab>("requests");

  const [addBuddyOpen, setAddBuddyOpen] = useState(false);
  const [activeChat, setActiveChat] = useState<{ id: string; name: string; avatar: string } | null>(null);
  const [activeGroupChat, setActiveGroupChat] = useState<{ id: string; title: string } | null>(null);
  // Which single buddy-request row currently has an Accept/Decline round
  // trip in flight, so a second click (or clicking the other button) during
  // that trip can't fire a duplicate/contradictory response.
  const [respondingId, setRespondingId] = useState<string | null>(null);

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
          <h1 className="text-lg font-bold text-white">{t.inbox.signInTitle}</h1>
          <p className="text-xs text-slate-400">{t.inbox.signInBody}</p>
          <button
            onClick={() => requireAuth()}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            {t.profile.signIn}
          </button>
        </div>
      </main>
    );
  }

  async function handleRespond(requestId: string, accept: boolean) {
    if (respondingId) return;
    setRespondingId(requestId);
    try {
      await respondToBuddyRequest(requestId, accept);
      await load();
    } catch (err) {
      console.error("Could not respond to buddy request:", err);
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">{t.inbox.title}</h1>
            <p className="text-xs text-slate-400">{t.inbox.subtitle}</p>
          </div>
          <button
            onClick={() => setAddBuddyOpen(true)}
            className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <UserPlus className="w-4 h-4" /> {t.inbox.addBuddy}
          </button>
        </div>

        {status === "loading" && <p className="text-xs text-slate-500 text-center py-10">{t.profile.loading}</p>}
        {status === "error" && (
          <p className="text-xs text-rose-400 text-center py-10">{t.inbox.loadError}</p>
        )}

        {status === "ready" && (
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit max-w-full overflow-x-auto">
            <InboxTabButton
              label={t.inbox.tabRequests}
              icon={UserPlus}
              count={requests.length}
              active={activeTab === "requests"}
              onClick={() => setActiveTab("requests")}
            />
            <InboxTabButton
              label={t.inbox.tabMessages}
              icon={MessageSquare}
              count={conversations.filter((c) => c.unread).length}
              active={activeTab === "messages"}
              onClick={() => setActiveTab("messages")}
            />
            <InboxTabButton
              label={t.inbox.tabGroups}
              icon={Users}
              count={0}
              active={activeTab === "groups"}
              onClick={() => setActiveTab("groups")}
            />
          </div>
        )}

        {/* BUDDY REQUESTS */}
        {status === "ready" && activeTab === "requests" && (
          <div className="space-y-3">
            {requests.length === 0 && (
              <EmptyState emoji="📭" text={t.inbox.noRequests} />
            )}
            {requests.map((req) => {
              const person = req.profiles || {
                name: t.inbox.fallbackDiverName,
                avatar_url: "",
                cert: "",
                diver_id: "",
                equipped_avatar_id: null,
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
                    <DiverAvatar
                      avatarUrl={person.avatar_url}
                      equippedAvatarId={person.equipped_avatar_id}
                      cert={person.cert}
                      sizeClass="w-10 h-10"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate hover:underline">{person.name}</p>
                      <p className="text-[11px] text-slate-500">{t.inbox.wantsBuddy}</p>
                    </div>
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleRespond(req.id, true)}
                      disabled={respondingId === req.id}
                      className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold px-3 py-2 rounded-xl text-[10px] transition-colors"
                    >
                      {respondingId === req.id ? "…" : t.inbox.accept}
                    </button>
                    <button
                      onClick={() => handleRespond(req.id, false)}
                      disabled={respondingId === req.id}
                      className="bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-300 font-bold px-3 py-2 rounded-xl text-[10px] transition-colors"
                    >
                      {respondingId === req.id ? "…" : t.inbox.decline}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MESSAGES */}
        {status === "ready" && activeTab === "messages" && (
          <div className="space-y-3">
            {conversations.length === 0 && (
              <EmptyState emoji="💬" text={t.inbox.noConversations} />
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
                  <DiverAvatar
                    avatarUrl={c.partner.avatar_url}
                    equippedAvatarId={c.partner.equipped_avatar_id}
                    cert={c.partner.cert}
                    sizeClass="w-9 h-9"
                  />
                </button>
                <button
                  onClick={() =>
                    setActiveChat({
                      id: c.partner.id,
                      name: c.partner.name,
                      avatar: resolveAvatarUrl(c.partner.avatar_url, c.partner.equipped_avatar_id),
                    })
                  }
                  className="flex-1 flex items-center justify-between min-w-0 text-left ml-3"
                >
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{c.partner.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {c.lastMessage.sender_id === user.id ? `${t.inbox.youPrefix} ${c.lastMessage.content}` : c.lastMessage.content}
                    </p>
                  </div>
                  {c.unread && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 ml-2" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TRIP GROUP CHATS */}
        {status === "ready" && activeTab === "groups" && (
          <div className="space-y-3">
            {groupChats.length === 0 && (
              <EmptyState emoji="🤿" text={t.inbox.noGroupChats} />
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
                      <p className="text-[11px] text-slate-400 truncate">{subtitle || t.inbox.groupChatFallback}</p>
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

function InboxTabButton({
  label,
  icon: Icon,
  count,
  active,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
        active ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-slate-200"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
      {count > 0 && (
        <span
          className={`text-[10px] font-black rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center ${
            active ? "bg-slate-950/20 text-slate-950" : "bg-cyan-500/20 text-cyan-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
