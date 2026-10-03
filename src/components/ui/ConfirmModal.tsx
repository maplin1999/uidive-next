"use client";

import { AlertTriangle } from "lucide-react";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useLocale } from "@/components/i18n/LocaleContext";

// A themed stand-in for window.confirm(), which renders as the browser's
// own unstyled system dialog (title bar showing the raw URL, plain OS
// buttons) no matter what theme the rest of the app uses. Same glass-panel
// modal chrome as every other modal on the site (bg-slate-900, rounded-3xl,
// backdrop-blur) so a destructive action gets a confirmation that actually
// looks like it belongs here. Stacks above an already-open modal (z-[60] vs
// the standard z-50) since its most common use is confirming an action
// triggered from inside another modal, like BookingDetailModal's Cancel
// Booking button.
export function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = true,
  confirming = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  useEscapeClose(onCancel);

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              destructive ? "bg-rose-500/10 border border-rose-500/30" : "bg-cyan-500/10 border border-cyan-500/30"
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${destructive ? "text-rose-400" : "text-cyan-400"}`} />
          </div>
          <div className="min-w-0 pt-1">
            <h3 className="font-bold text-white text-sm">{title}</h3>
            <p className="text-xs text-slate-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors disabled:opacity-60"
          >
            {cancelLabel ?? t.common.cancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-60 ${
              destructive
                ? "bg-rose-500 hover:bg-rose-400 text-slate-950"
                : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            }`}
          >
            {confirming ? t.common.working : (confirmLabel ?? t.common.confirm)}
          </button>
        </div>
      </div>
    </div>
  );
}
