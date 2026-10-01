"use client";

import { useState } from "react";
import { X, UserPlus, Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { DiverSearchResult, searchDivers, sendBuddyRequest } from "@/lib/inbox";
import { useToast, Toast } from "@/components/Toast";
import { DiverAvatar } from "@/components/DiverAvatar";

type SendState = "idle" | "sending" | "sent" | "already";

// Migrated from the old site's #add-friend-modal (openAddFriendModal() /
// searchForBuddy() / sendBuddyRequest()). Searches by Diver ID or partial
// name via the search_divers() RPC.
export function AddBuddyModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const { message, showToast } = useToast();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<DiverSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendStates, setSendStates] = useState<Record<string, SendState>>({});

  if (!user) return null;

  async function handleSearch() {
    const q = query.trim();
    if (!q) {
      setStatus("Enter a Diver ID or name first.");
      return;
    }
    setSearching(true);
    setStatus("Searching…");
    setResults([]);
    try {
      const data = await searchDivers(q);
      if (data.length === 0) {
        setStatus("No divers found with that ID or name.");
      } else {
        setStatus(`${data.length} diver${data.length === 1 ? "" : "s"} found:`);
        setResults(data);
      }
    } catch (err) {
      console.error("Buddy search failed:", err);
      setStatus("Search failed -- please try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSend(addresseeId: string) {
    setSendStates((prev) => ({ ...prev, [addresseeId]: "sending" }));
    try {
      await sendBuddyRequest(user!.id, addresseeId);
      setSendStates((prev) => ({ ...prev, [addresseeId]: "sent" }));
      showToast("🤿 Buddy request sent!");
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "23505") {
        setSendStates((prev) => ({ ...prev, [addresseeId]: "already" }));
      } else {
        console.error("Could not send buddy request:", err);
        setSendStates((prev) => ({ ...prev, [addresseeId]: "idle" }));
        showToast(err instanceof Error ? `❌ ${err.message}` : "❌ Could not send buddy request.");
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyan-400" /> Add Dive Buddy
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <label className="text-slate-400 block font-semibold">Enter Diver ID or Name</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="e.g. DIV-4F9A2B or Elena"
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              aria-label="Search for a dive buddy"
              className="shrink-0 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 border border-slate-700 text-cyan-400 font-bold px-4 py-3 rounded-xl transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {status && <p className="text-slate-500">{status}</p>}

          <div className="space-y-2 max-h-52 overflow-y-auto">
            {results.map((person) => {
              const sendState = sendStates[person.id] || "idle";
              return (
                <div
                  key={person.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <DiverAvatar
                      avatarUrl={person.avatar_url}
                      equippedAvatarId={person.equipped_avatar_id}
                      cert={person.cert}
                      sizeClass="w-9 h-9"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{person.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        #{person.diver_id} • {person.cert}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSend(person.id)}
                    disabled={sendState !== "idle"}
                    className="shrink-0 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold px-3 py-2 rounded-lg text-[11px] transition-colors"
                  >
                    {sendState === "sending"
                      ? "Sending…"
                      : sendState === "sent"
                        ? "Request sent ✓"
                        : sendState === "already"
                          ? "Already sent"
                          : "Send Request"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Toast message={message} />
    </div>
  );
}
