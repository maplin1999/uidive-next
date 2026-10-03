"use client";

import { useState } from "react";
import { X, CheckCircle, Backpack } from "lucide-react";
import { EQUIPMENT_ITEMS } from "@/lib/trips";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useLocale } from "@/components/i18n/LocaleContext";

// Migrated from the old site's #equipment-checklist-modal -- shown after
// tapping "Confirm & Pay" on a trip, so a diver can flag what gear they're
// bringing before heading to checkout. This modal's own confirm hands off
// to DiveDetailModal's handleFinalize(), which starts real Revolut
// checkout (see src/lib/checkout.ts) -- the spot is only truly reserved
// once that order is created, not yet at this step.
export function EquipmentChecklistModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (equipment: Record<string, boolean>) => void;
}) {
  const { t } = useLocale();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEscapeClose(onClose);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Backpack className="w-4 h-4 text-cyan-400" /> {t.equipment.title}
          </h3>
          <button
            onClick={onClose}
            aria-label={t.equipment.close}
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">{t.equipment.description}</p>

        <div className="space-y-2">
          {EQUIPMENT_ITEMS.map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-colors"
            >
              <span className="text-sm text-slate-200 font-semibold">
                {t.equipment.items[item.id as keyof typeof t.equipment.items] ?? item.label}
              </span>
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
          <span>{t.equipment.continueToPayment}</span>
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
