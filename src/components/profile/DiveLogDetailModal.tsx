"use client";

import { Anchor, Clock, Gauge, Trash2, Pencil, X, Users, StickyNote } from "lucide-react";
import { DiveLog, formatDiveDate } from "@/lib/dive-log";
import { EQUIPMENT_ITEMS } from "@/lib/trips";
import { useEscapeClose } from "@/lib/useEscapeClose";

// Single dive's full detail -- opened by tapping an entry in the logbook.
// Owner-only (same privacy as the logbook itself), with Edit/Delete actions
// that hand off to DiveLogFormModal / a ConfirmModal one level up.
export function DiveLogDetailModal({
  diveLog,
  onClose,
  onEdit,
  onDelete,
}: {
  diveLog: DiveLog;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  useEscapeClose(onClose);
  const equipmentLabels = EQUIPMENT_ITEMS.filter((item) => diveLog.equipment.includes(item.id)).map(
    (item) => item.label
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-400" /> {diveLog.location}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{formatDiveDate(diveLog.dive_date)}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {diveLog.dive_site && (
          <p className="text-sm text-slate-300 font-semibold">{diveLog.dive_site}</p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<Gauge className="w-4 h-4 text-cyan-400" />} label="Max Depth" value={diveLog.depth_m != null ? `${diveLog.depth_m}m` : "--"} />
          <Stat icon={<Clock className="w-4 h-4 text-cyan-400" />} label="Duration" value={diveLog.duration_min != null ? `${diveLog.duration_min} min` : "--"} />
        </div>

        {diveLog.buddy_name && (
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-500 shrink-0" /> Dove with{" "}
            <span className="text-slate-200 font-semibold">{diveLog.buddy_name}</span>
          </p>
        )}

        {diveLog.notes && (
          <p className="text-xs text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-start gap-2">
            <StickyNote className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" /> {diveLog.notes}
          </p>
        )}

        {equipmentLabels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {equipmentLabels.map((label) => (
              <span
                key={label}
                className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={onDelete}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        {icon} {label}
      </p>
      <p className="text-sm font-bold text-white">{value}</p>
    </div>
  );
}
