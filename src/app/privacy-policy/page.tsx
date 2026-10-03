"use client";

import Link from "next/link";
import { ArrowLeft, Database, Settings2, SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Split out of the old combined /legal page -- see terms-of-service/page.tsx
// for the matching Terms route and the reasoning. Content is unchanged,
// still the t.legal.* privacy* strings already translated in en/es/fr.
//
// Structure matches about-us/page.tsx's own section rhythm -- see
// terms-of-service/page.tsx for the same Hero + banded Key Points +
// full-document + cross-link-CTA reasoning.
export default function PrivacyPolicyPage() {
  const { t } = useLocale();

  const highlights = [
    { icon: Database, title: t.legal.infoWeCollectHeading, body: t.legal.privacyHighlightInfoBody },
    { icon: Settings2, title: t.legal.howWeUseItHeading, body: t.legal.privacyHighlightUseBody },
    { icon: SlidersHorizontal, title: t.legal.yourChoicesHeading, body: t.legal.privacyHighlightChoicesBody },
  ];

  return (
    <main className="bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-950 to-slate-950" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                {t.legal.privacyEyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {t.legal.privacyTitle}
              </h1>
              <p className="mt-4 text-xs text-slate-500">
               {t.legal.effectiveDate}
              </p>
            </div>
          </div>
      </section>

      {/* Key points */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {t.legal.privacyContentEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.legal.privacyContentTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.legal.privacyContentBody}</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <Icon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Full policy */}
      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">{t.legal.fullPolicyEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.legal.fullPolicyTitle}</h2>
        </div>

        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
            <p>{t.legal.privacyIntro}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.infoWeCollectHeading}</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong className="text-slate-200">{t.legal.accountInfoLabel}</strong> — {t.legal.accountInfoBody}
              </li>
              <li>
                <strong className="text-slate-200">{t.legal.profileContentLabel}</strong> — {t.legal.profileContentBody}
              </li>
              <li>
                <strong className="text-slate-200">{t.legal.bookingInfoLabel}</strong> — {t.legal.bookingInfoBody}
              </li>
              <li>
                <strong className="text-slate-200">{t.legal.hostInfoLabel}</strong> — {t.legal.hostInfoBody}
              </li>
              <li>
                <strong className="text-slate-200">{t.legal.usageDataLabel}</strong> — {t.legal.usageDataBody}
              </li>
              <li>
                <strong className="text-slate-200">{t.legal.cookiesLabel}</strong> — {t.legal.cookiesListBody}
              </li>
            </ul>

            <h3 className="text-sm font-bold text-white">{t.legal.howWeUseItHeading}</h3>
            <p>{t.legal.howWeUseItBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.cookiesHeading}</h3>
            <p>{t.legal.cookiesBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.sharingHeading}</h3>
            <p>{t.legal.sharingBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.yourChoicesHeading}</h3>
            <p>{t.legal.yourChoicesBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.childrensPrivacyHeading}</h3>
            <p>{t.legal.childrensPrivacyBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.changesToPolicyHeading}</h3>
            <p>{t.legal.changesToPolicyBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.contactUsHeading}</h3>
            <p>
              {t.legal.privacyContactBody}{" "}
              <a href="mailto:privacy@uidive.com" className="text-cyan-400 hover:underline">
                privacy@uidive.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Cross-link */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-16 text-center sm:px-12">
          <Link
            href="/terms-of-service"
            className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {t.legal.viewTermsLink}
          </Link>
        </div>
      </section>
    </main>
  );
}
