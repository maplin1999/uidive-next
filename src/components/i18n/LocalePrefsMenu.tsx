"use client";

import { useRef, useState } from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { useCurrency } from "@/components/currency/CurrencyContext";
import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/lib/i18n/locales";
import { CURRENCY_LABELS, SUPPORTED_CURRENCIES } from "@/lib/currency/currencies";
import { useClickOutside } from "@/lib/useClickOutside";

// One combined globe-icon dropdown for both language and currency, rather
// than two separate header buttons -- the header's already tight on space
// (logo, nav, Corals balance, theme toggle, account menu all compete for
// room on a phone-width screen), and the two preferences are closely
// related enough that pairing them in one panel reads naturally.
export function LocalePrefsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { locale, setLocale, t } = useLocale();
  const { currency, setCurrency } = useCurrency();
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title={t.header.language}
        aria-label={t.header.language}
        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
      >
        <Globe className="w-4 h-4 text-slate-300" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 p-3 space-y-3">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t.header.language}
            </div>
            <div className="space-y-0.5">
              {SUPPORTED_LOCALES.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    loc === locale ? "bg-cyan-500/10 text-cyan-400" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {LOCALE_LABELS[loc]}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 pt-2.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t.header.currency}
            </div>
            <div className="space-y-0.5">
              {SUPPORTED_CURRENCIES.map((cur) => (
                <button
                  key={cur}
                  onClick={() => {
                    setCurrency(cur);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    cur === currency ? "bg-cyan-500/10 text-cyan-400" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {CURRENCY_LABELS[cur]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
