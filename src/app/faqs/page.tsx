"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";
import type { Dictionary } from "@/lib/i18n/translations/en";

// New page -- no FAQ existed on the old vanilla site. Questions are drawn
// from how the app actually works (Revolut checkout + hold expiry, dive
// logs, Corals, hosting) rather than generic boilerplate, so this stays
// accurate as those features change rather than becoming stale copy.
//
// Structure matches about-us/page.tsx -- a full-width gradient Hero
// (eyebrow/title/intro) followed by content sections, rather than the
// compact back-link-and-card layout this page (and the other footer
// pages) started with, so the whole footer section reads as one
// consistent visual language.
type FaqKeyPair = { qKey: keyof Dictionary["faq"]; aKey: keyof Dictionary["faq"] };

const FAQ_KEYS: FaqKeyPair[] = [
  { qKey: "q1", aKey: "a1" },
  { qKey: "q2", aKey: "a2" },
  { qKey: "q3", aKey: "a3" },
  { qKey: "q4", aKey: "a4" },
  { qKey: "q5", aKey: "a5" },
  { qKey: "q6", aKey: "a6" },
  { qKey: "q7", aKey: "a7" },
  { qKey: "q8", aKey: "a8" },
];

export default function FaqPage() {
  const { t } = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-950 to-slate-950" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
          <Link
            href="/"
            className="mb-6 flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> {t.faq.back}
          </Link>

          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {t.faq.eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.faq.heading}</h1>
            <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg">
              {t.faq.cantFindPrefix}{" "}
              <a href="mailto:support@uidive.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                {t.faq.contactUs}
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="mx-auto max-w-3xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl divide-y divide-slate-800 overflow-hidden">
          {FAQ_KEYS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.qKey}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-bold text-white">{t.faq[item.qKey]}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-5 sm:px-6 pb-4 -mt-1">
                    <p className="text-xs text-slate-400 leading-relaxed">{t.faq[item.aKey]}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
