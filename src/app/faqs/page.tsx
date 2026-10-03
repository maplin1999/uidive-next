"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, CreditCard, Award, Anchor } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";
import type { Dictionary } from "@/lib/i18n/translations/en";

// New page -- no FAQ existed on the old vanilla site. Questions are drawn
// from how the app actually works (Revolut checkout + hold expiry, dive
// logs, Corals, hosting) rather than generic boilerplate, so this stays
// accurate as those features change rather than becoming stale copy.
//
// Structure matches about-us/page.tsx's own section rhythm: Hero, a banded
// section with a centered intro + icon-badge card grid (Mission's shape),
// an unbanded section with a left-aligned intro + the actual content
// (What We Do's shape), and a closing muted-gradient CTA card.
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

  const topics = [
    { icon: CreditCard, title: t.faq.topic1Title, body: t.faq.topic1Body },
    { icon: Award, title: t.faq.topic2Title, body: t.faq.topic2Body },
    { icon: Anchor, title: t.faq.topic3Title, body: t.faq.topic3Body },
  ];

  return (
    <main className="bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-950 to-slate-950" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                {t.faq.eyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {t.faq.heading}
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
               {t.faq.cantFindPrefix}{" "}
              <a href="mailto:support@uidive.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                {t.faq.contactUs}
              </a>
              .
              </p>
            </div>
          </div>
      </section>

      {/* Topics */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {t.faq.contentEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.faq.contentTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.faq.contentBody}</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <article key={topic.title} className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">{topic.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{topic.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* All questions */}
      <section className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
            {t.faq.allQuestionsEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.faq.allQuestionsTitle}</h2>
        </div>

        <div className="mt-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl divide-y divide-slate-800 overflow-hidden">
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

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-16 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.faq.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">{t.faq.ctaBody}</p>
          <div className="mt-8">
            <a
              href="mailto:support@uidive.com"
              className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              {t.faq.ctaButton}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
