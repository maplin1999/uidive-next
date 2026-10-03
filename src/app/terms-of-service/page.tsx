"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Split out of the old combined /legal page (which tabbed between Privacy
// and Terms) into its own route so it matches the footer's separate
// "Terms of Service" / "Privacy Policy" links instead of one shared page
// with a query-param tab. Content is unchanged -- still the t.legal.* terms*
// strings, already translated in en/es/fr -- only the page shell changed.
//
// Structure matches about-us/page.tsx -- a full-width gradient Hero, then
// the terms themselves in a single card (breaking a legal document into
// separate "cards" per clause isn't useful the way it is for Mission or
// What We Do), closing with a muted-gradient cross-link card in the same
// style as the About Us CTA section instead of a plain text link.
export default function TermsOfServicePage() {
  const { t } = useLocale();

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
            <ArrowLeft className="w-4 h-4" /> {t.legal.back}
          </Link>

          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {t.legal.termsEyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.legal.termsTitle}</h1>
            <p className="mt-4 text-xs text-slate-500">{t.legal.effectiveDate}</p>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="mx-auto max-w-3xl px-6 pb-16 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
            <p>{t.legal.termsIntro}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.yourAccountHeading}</h2>
            <p>{t.legal.yourAccountBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.bookingsCancellationsHeading}</h2>
            <p>{t.legal.bookingsCancellationsBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.hostingTripsHeading}</h2>
            <p>{t.legal.hostingTripsBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.assumptionOfRiskHeading}</h2>
            <p>{t.legal.assumptionOfRiskBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.communityConductHeading}</h2>
            <p>{t.legal.communityConductBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.coralsVouchersHeading}</h2>
            <p>{t.legal.coralsVouchersBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.disclaimerHeading}</h2>
            <p>{t.legal.disclaimerBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.changesToTermsHeading}</h2>
            <p>{t.legal.changesToTermsBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.contactUsHeading}</h2>
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
      <section className="mx-auto max-w-3xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-8 text-center sm:px-10">
          <Link href="/privacy-policy" className="inline-flex items-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            {t.legal.viewPrivacyLink}
          </Link>
        </div>
      </section>
    </main>
  );
}
