"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { useClickOutside } from "@/lib/useClickOutside";
import { useLocale } from "@/components/i18n/LocaleContext";

// Themed stand-in for native <input type="time">, same reasoning as
// ThemedSelect: the native control's own dropdown/spinner is OS-drawn and
// can't be restyled, so it breaks the dark theme regardless of color-scheme.
// Stores/returns the same 24-hour "HH:MM" string the native input used, so
// no change is needed anywhere this value is read or saved (TripFormFields,
// create_trip/update_trip, etc.) -- only how it's picked changes.
function buildTimeOptions(stepMinutes: number) {
  const options: { value: string; label: string }[] = [];
  for (let m = 0; m < 24 * 60; m += stepMinutes) {
    const h24 = Math.floor(m / 60);
    const min = m % 60;
    const value = `${String(h24).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    options.push({ value, label: formatLabel(h24, min) });
  }
  return options;
}

function formatLabel(h24: number, min: number): string {
  const period = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, "0")} ${period}`;
}

function formatValue(value: string): string | null {
  if (!value) return null;
  const [hStr, mStr] = value.split(":");
  const h24 = Number(hStr);
  const min = Number(mStr);
  if (Number.isNaN(h24) || Number.isNaN(min)) return null;
  return formatLabel(h24, min);
}

const TIME_OPTIONS = buildTimeOptions(30);

export function ThemedTimeSelect({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  useClickOutside(ref, () => setOpen(false));

  // Jump the panel straight to the current selection on open, since 48
  // half-hour slots don't all fit in the scroll area at once.
  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center" });
    }
  }, [open]);

  const label = formatValue(value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 hover:border-slate-700 text-sm text-left flex items-center justify-between gap-2 transition-colors focus:outline-none focus:border-cyan-500"
      >
        <span className={label ? "text-slate-200" : "text-slate-500"}>{label ?? (placeholder ?? t.themedTimeSelect.selectTime)}</span>
        <Clock className="w-4 h-4 text-slate-500 shrink-0" />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1.5 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 max-h-56 overflow-y-auto space-y-0.5">
          {TIME_OPTIONS.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                ref={active ? activeRef : undefined}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  active
                    ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-300"
                    : "border border-transparent text-slate-300 hover:bg-slate-800"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
