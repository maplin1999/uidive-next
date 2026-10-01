"use client";

import { useEffect, useState } from "react";
import { X, Award, Users } from "lucide-react";
import { HostTrip, RosterDiver, fetchTripRoster } from "@/lib/host";
import { DiverAvatar } from "@/components/DiverAvatar";

// Migrated from the old site's openHostTripRosterModal() -- lists the divers
// booked on a trip via the get_trip_roster() RPC.
export function TripRosterModal({ trip, onClose }: { trip: HostTrip; onClose: () => void }) {
  const [divers, setDivers] = useState<RosterDiver[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    fetchTripRoster(trip.id)
      .then(setDivers)
      .then(() => setStatus("ready"))
      .catch((err) => {
        console.error("Could not load roster:", err);
        setStatus("error");
      });
  }, [trip.id]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" /> Trip Roster
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{trip.title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {status === "loading" && <p className="text-xs text-slate-500 text-center py-6">Loading…</p>}
        {status === "error" && (
          <p className="text-xs text-rose-400 text-center py-6">
            Could not load the roster -- please try again.
          </p>
        )}
        {status === "ready" && divers.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-6">No divers booked yet.</p>
        )}
        {status === "ready" && divers.length > 0 && (
          <div className="space-y-2">
            {divers.map((d) => (
              <div
                key={d.diver_user_id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800"
              >
                <DiverAvatar
                  avatarUrl={d.diver_avatar_url}
                  equippedAvatarId={d.equipped_avatar_id}
                  cert={d.diver_cert}
                  sizeClass="w-10 h-10"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {d.diver_name}
                    {d.is_you && (
                      <span className="ml-1.5 text-[10px] font-bold text-cyan-400">(you)</span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> {d.diver_cert}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
