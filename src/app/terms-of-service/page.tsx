"use client";

import Link from "next/link";
import { ArrowLeft, UserCog, CalendarCheck, TriangleAlert } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Split out of the old combined /legal page (which tabbed between Privacy
// and Terms) into its own route so it matches the footer's separate
// "Terms of Service" / "Privacy Policy" links instead of one shared page
// with a query-param tab. Content is unchanged -- still the t.legal.* terms*
// strings, already translated in en/es/fr -- only the page shell changed.
//
// Structure matches about-us/page.tsx's own section rhythm: Hero, a banded
// "Key Points" section with a centered intro + icon-badge card grid
// (Mission's shape -- three of the terms highlighted, not the whole
// document), the full terms in a single card (What We Do's shape doesn't
// fit a legal document, so this stays one block), and a closing
// muted-gradient cross-link card (the CTA's shape) instead of a plain text
// link.
export default function TermsOfServicePage() {
  const { t } = useLocale();

  const highlights = [
    { icon: UserCog, title: t.legal.yourAccountHeading, body: t.legal.termsHighlightAccountBody },
    { icon: CalendarCheck, title: t.legal.bookingsCancellationsHeading, body: t.legal.termsHighlightBookingsBody },
    { icon: TriangleAlert, title: t.legal.assumptionOfRiskHeading, body: t.legal.termsHighlightRiskBody },
  ];

  return (
    <main className="bg-slate-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-950 to-slate-950" />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                {t.legal.termsEyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {t.legal.termsTitle}
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
              {t.legal.termsContentEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.legal.termsContentTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.legal.termsContentBody}</p>
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

      {/* Full terms */}
      <section className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">{t.legal.fullTermsEyebrow}</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.legal.fullTermsTitle}</h2>
        </div>

        <div className="mt-10 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
            <p>{t.legal.termsIntro}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.yourAccountHeading}</h3>
            <p>{t.legal.yourAccountBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.bookingsCancellationsHeading}</h3>
            <p>{t.legal.bookingsCancellationsBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.hostingTripsHeading}</h3>
            <p>{t.legal.hostingTripsBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.assumptionOfRiskHeading}</h3>
            <p>{t.legal.assumptionOfRiskBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.communityConductHeading}</h3>
            <p>{t.legal.communityConductBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.coralsVouchersHeading}</h3>
            <p>{t.legal.coralsVouchersBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.disclaimerHeading}</h3>
            <p>{t.legal.disclaimerBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.changesToTermsHeading}</h3>
            <p>{t.legal.changesToTermsBody}</p>

            <h3 className="text-sm font-bold text-white">{t.legal.contactUsHeading}</h3>
            <p>
              {t.legal.termsContactBody}{" "}
              <a href="mailto:support@uidive.com" className="text-cyan-400 hover:underline">
                support@uidive.com
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
            href="/privacy-policy"
            className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {t.legal.viewPrivacyLink}
          </Link>
        </div>
      </section>
    </main>
  );
}
