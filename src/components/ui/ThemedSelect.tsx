"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "@/lib/useClickOutside";

// A themed stand-in for native <select>, which renders its closed state with
// our CSS but hands the open dropdown panel off to the OS/browser -- on
// Windows that's an unstyled white-on-black system popup no matter what
// color-scheme we set, clashing hard with the rest of the dark UI. This
// draws both the closed control and the open list ourselves (same
// bg-slate-900/border-slate-800/cyan-accent panel the HeroSearch Activity
// dropdown and other menus already use), so it looks like the rest of the
// site in every state. Generic over the option value type so it can serve
// trip type / activity / difficulty (or any other small fixed list) without
// a new component each time.
export function ThemedSelect<T extends string>({
  value,
  options,
  onChange,
  invalid,
  placeholder,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const current = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm text-left bg-slate-950 transition-colors focus:outline-none focus:border-cyan-500 ${
          invalid ? "border-rose-500" : "border-slate-800 hover:border-slate-700"
        }`}
      >
        <span className={current ? "text-slate-200" : "text-slate-500"}>
          {current?.label ?? placeholder ?? ""}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 top-full mt-1.5 left-0 right-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 space-y-0.5 max-h-56 overflow-y-auto">
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
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
