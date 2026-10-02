"use client";

import { useState } from "react";
import { X, CheckCircle, Backpack } from "lucide-react";
import { EQUIPMENT_ITEMS } from "@/lib/trips";

// Migrated from the old site's #equipment-checklist-modal -- shown after
// tapping "Confirm Booking" on a trip, so a diver can flag what gear
// they're bringing before the spot is actually reserved. This modal's own
// "Confirm Booking" is what finalizes the real booking.
export function EquipmentChecklistModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (equipment: Record<string, boolean>) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Backpack className="w-4 h-4 text-cyan-400" /> Gear Checklist
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Check off what you&apos;re bringing yourself -- anything left unchecked, your dive host
          will have ready to rent.
        </p>

        <div className="space-y-2">
          {EQUIPMENT_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-colors"
            >
              <span className="text-sm text-slate-200 font-semibold">{item.label}</span>
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={(e) => setChecked((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                className="w-5 h-5 accent-cyan-500 rounded shrink-0"
              />
            </label>
          ))}
        </div>

        <button
          onClick={() => onConfirm(checked)}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <span>Confirm Booking</span>
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
