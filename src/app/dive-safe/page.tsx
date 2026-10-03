"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, ClipboardCheck, Gauge, CloudSun, LifeBuoy } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New page -- dive safety guidance for the footer's "Dive Safe" link.
// Complements (rather than duplicates) the Terms of Service's Assumption
// of Risk section: this is practical guidance, that's the legal language.
//
// Structure matches about-us/page.tsx -- a full-width gradient Hero, then
// the six guidance cards in the same icon-badge grid style as the About Us
// What We Do section, closing with a muted-gradient card (same recipe as
// the About Us CTA) pointing to the Terms of Service instead of a plain
// text link.
export default function DiveSafePage() {
  const { t } = useLocale();

  const sections = [
    { icon: GraduationCap, title: t.diveSafePage.certificationHeading, body: t.diveSafePage.certificationBody },
    { icon: Users, title: t.diveSafePage.buddySystemHeading, body: t.diveSafePage.buddySystemBody },
    { icon: ClipboardCheck, title: t.diveSafePage.equipmentChecksHeading, body: t.diveSafePage.equipmentChecksBody },
    { icon: Gauge, title: t.diveSafePage.diveLimitsHeading, body: t.diveSafePage.diveLimitsBody },
    { icon: CloudSun, title: t.diveSafePage.environmentHeading, body: t.diveSafePage.environmentBody },
    { icon: LifeBuoy, title: t.diveSafePage.emergencyHeading, body: t.diveSafePage.emergencyBody },
  ];

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
            <ArrowLeft className="w-4 h-4" /> {t.diveSafePage.back}
          </Link>

          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {t.diveSafePage.eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.diveSafePage.heading}</h1>
            <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg">{t.diveSafePage.intro}</p>
          </div>
        </div>
      </section>

      {/* Guidance */}
      <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article
                key={section.title}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-400">{section.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Further reading */}
      <section className="mx-auto max-w-3xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-8 text-center sm:px-10">
          <p className="text-sm text-slate-300">{t.diveSafePage.furtherReadingNote}</p>
          <Link
            href="/terms-of-service"
            className="mt-4 inline-flex items-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {t.diveSafePage.furtherReadingLink}
          </Link>
        </div>
      </section>
    </main>
  );
}
