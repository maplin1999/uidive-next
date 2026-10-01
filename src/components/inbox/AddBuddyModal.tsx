"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { DEFAULT_AVATAR } from "@/lib/auth-types";
import { DiverSearchResult, searchDivers, sendBuddyRequest } from "@/lib/inbox";
import { diverCertRingClass } from "@/lib/diverRing";

// Migrated from the old site's #add-friend-modal (openAddFriendModal() /
// searchForBuddy() / sendBuddyRequest()). Searches by Diver ID or partial
// name via the search_divers() RPC.
export function AddBuddyModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [results, setResults] = useState<DiverSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());

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
    try {
      await sendBuddyRequest(user!.id, addresseeId);
      setSentIds((prev) => new Set(prev).add(addresseeId));
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "23505") {
        setSentIds((prev) => new Set(prev).add(addresseeId));
      } else {
        console.error("Could not send buddy request:", err);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <h3 className="font-bold text-white text-base">Add a Dive Buddy</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder="Diver ID or name"
            className="flex-1 bg-slate-950 px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-xs shrink-0 transition-colors"
          >
            Search
          </button>
        </div>

        {status && <p className="text-xs text-slate-400">{status}</p>}

        <div className="space-y-2">
          {results.map((person) => {
            const sent = sentIds.has(person.id);
            return (
              <div
                key={person.id}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={person.avatar_url || DEFAULT_AVATAR}
                    alt=""
                    className={`w-9 h-9 rounded-full object-cover border-2 ${diverCertRingClass(person.cert)}`}
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-white truncate text-sm">{person.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      #{person.diver_id} • {person.cert}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSend(person.id)}
                  disabled={sent}
                  className="shrink-0 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold px-3 py-2 rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  {sent ? "Sent ✓" : "Send Request"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
