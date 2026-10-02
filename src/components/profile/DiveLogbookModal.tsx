"use client";

import { useEffect, useState } from "react";
import { Anchor, Gauge, Plus, X } from "lucide-react";
import { DiveLog, deleteDiveLog, fetchDiveLogs, formatDiveDate } from "@/lib/dive-log";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { DiveLogFormModal } from "@/components/profile/DiveLogFormModal";
import { DiveLogDetailModal } from "@/components/profile/DiveLogDetailModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

// Opened by clicking your own "Dives" stat on the profile header -- the
// count itself stays public on every profile (see dive_log_stats), but the
// actual logbook of entries is only ever opened for the signed-in owner.
export function DiveLogbookModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [logs, setLogs] = useState<DiveLog[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<DiveLog | null>(null);
  const [editing, setEditing] = useState<DiveLog | null>(null);
  const [deleting, setDeleting] = useState<DiveLog | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEscapeClose(onClose);

  function load() {
    setStatus("loading");
    fetchDiveLogs(userId)
      .then((data) => {
        setLogs(data);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load your dive log:", err);
        setStatus("error");
      });
  }

  useEffect(load, [userId]);

  function handleSaved() {
    setFormOpen(false);
    setEditing(null);
    setSelected(null);
    load();
  }

  async function handleConfirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteDiveLog(deleting.id);
      setDeleting(null);
      setSelected(null);
      load();
    } catch (err) {
      console.error("Could not delete this dive:", err);
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3.5 shrink-0">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Anchor className="w-4 h-4 text-cyan-400" /> Dive Log
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Your private logbook -- only you can see these entries.</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setFormOpen(true)}
            className="shrink-0 w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Log a Dive
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 -mx-1 px-1">
            {status === "loading" && <p className="text-xs text-slate-500 text-center py-6">Loading your dives…</p>}
            {status === "error" && (
              <p className="text-xs text-rose-400 text-center py-6">Could not load your dive log.</p>
            )}
            {status === "ready" && logs.length === 0 && (
              <div className="text-center py-10 space-y-1.5">
                <div className="text-3xl">🤿</div>
                <p className="text-sm font-bold text-white">No dives logged yet</p>
                <p className="text-xs text-slate-400">Tap &quot;Log a Dive&quot; to start your logbook.</p>
              </div>
            )}
            {status === "ready" &&
              logs.map((log) => (
                <button
                  key={log.id}
                  onClick={() => setSelected(log)}
                  className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{log.location}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {formatDiveDate(log.dive_date)}
                      {log.dive_site ? ` • ${log.dive_site}` : ""}
                    </p>
                  </div>
                  {log.depth_m != null && (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-cyan-400">
                      <Gauge className="w-3.5 h-3.5" /> {log.depth_m}m
                    </span>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>

      {formOpen && (
        <DiveLogFormModal userId={userId} onClose={() => setFormOpen(false)} onSaved={handleSaved} />
      )}

      {selected && !editing && (
        <DiveLogDetailModal
          diveLog={selected}
          onClose={() => setSelected(null)}
          onEdit={() => setEditing(selected)}
          onDelete={() => setDeleting(selected)}
        />
      )}

      {editing && (
        <DiveLogFormModal userId={userId} diveLog={editing} onClose={() => setEditing(null)} onSaved={handleSaved} />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete this dive?"
          message={`This permanently removes your ${formatDiveDate(deleting.dive_date)} dive at ${deleting.location} from your log.`}
          confirmLabel="Delete"
          confirming={deleteBusy}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
