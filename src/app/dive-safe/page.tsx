"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, ClipboardCheck, Gauge, CloudSun, LifeBuoy } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New page -- dive safety guidance for the footer's "Dive Safe" link.
// Complements (rather than duplicates) the Terms of Service's Assumption
// of Risk section: this is practical guidance, that's the legal language.
//
// Structure matches about-us/page.tsx's own section rhythm: Hero, a banded
// section with a centered intro + icon-badge card grid (Mission's shape,
// sized up to all six guidelines rather than a highlighted three), and a
// closing muted-gradient card (the CTA's shape) pointing to the Terms of
// Service instead of a plain text link.
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
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                {t.diveSafePage.eyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {t.diveSafePage.heading}
              </h1>
              <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg">{t.diveSafePage.intro}</p>
            </div>
          </div>
      </section>

      {/* Guidance */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {t.diveSafePage.contentEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.diveSafePage.contentTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.diveSafePage.contentBody}</p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                  <h3 className="mt-4 text-lg font-bold text-white">{section.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{section.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Further reading */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-16 text-center sm:px-12">
          <p className="text-sm text-slate-300 max-w-2xl mx-auto">{t.diveSafePage.furtherReadingNote}</p>
          <div className="mt-8">
            <Link
              href="/terms-of-service"
              className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              {t.diveSafePage.furtherReadingLink}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
