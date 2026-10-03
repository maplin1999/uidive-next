"use client";

import Link from "next/link";
import { ArrowLeft, GraduationCap, Users, ClipboardCheck, Gauge, CloudSun, LifeBuoy } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New page -- dive safety guidance for the footer's "Dive Safe" link.
// Complements (rather than duplicates) the Terms of Service's Assumption
// of Risk section: this is practical guidance, that's the legal language.
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
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {t.diveSafePage.back}
        </Link>

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">{t.diveSafePage.eyebrow}</p>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{t.diveSafePage.heading}</h1>
            <p className="text-sm text-slate-400 leading-relaxed">{t.diveSafePage.intro}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <article
                key={section.title}
                className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="mt-4 text-sm font-bold text-white">{section.title}</h2>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{section.body}</p>
              </article>
            );
          })}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {t.diveSafePage.furtherReadingNote}{" "}
          <Link href="/terms-of-service" className="text-cyan-400 hover:underline font-semibold">
            {t.diveSafePage.furtherReadingLink}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
