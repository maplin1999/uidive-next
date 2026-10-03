"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Split out of the old combined /legal page -- see terms-of-service/page.tsx
// for the matching Terms route and the reasoning. Content is unchanged,
// still the t.legal.* privacy* strings already translated in en/es/fr.
//
// Structure matches about-us/page.tsx -- see terms-of-service/page.tsx for
// the same Hero + single card + cross-link-CTA reasoning.
export default function PrivacyPolicyPage() {
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
              {t.legal.privacyEyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.legal.privacyTitle}</h1>
            <p className="mt-4 text-xs text-slate-500">{t.legal.effectiveDate}</p>
          </div>
        </div>
      </section>

      {/* Privacy Policy */}
      <section className="mx-auto max-w-3xl px-6 pb-16 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
            <p>{t.legal.privacyIntro}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.infoWeCollectHeading}</h2>
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

            <h2 className="text-sm font-bold text-white">{t.legal.howWeUseItHeading}</h2>
            <p>{t.legal.howWeUseItBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.cookiesHeading}</h2>
            <p>{t.legal.cookiesBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.sharingHeading}</h2>
            <p>{t.legal.sharingBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.yourChoicesHeading}</h2>
            <p>{t.legal.yourChoicesBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.childrensPrivacyHeading}</h2>
            <p>{t.legal.childrensPrivacyBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.changesToPolicyHeading}</h2>
            <p>{t.legal.changesToPolicyBody}</p>

            <h2 className="text-sm font-bold text-white">{t.legal.contactUsHeading}</h2>
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
      <section className="mx-auto max-w-3xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-8 text-center sm:px-10">
          <Link href="/terms-of-service" className="inline-flex items-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
            {t.legal.viewTermsLink}
          </Link>
        </div>
      </section>
    </main>
  );
}
