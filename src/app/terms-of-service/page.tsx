"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Split out of the old combined /legal page (which tabbed between Privacy
// and Terms) into its own route so it matches the footer's separate
// "Terms of Service" / "Privacy Policy" links instead of one shared page
// with a query-param tab. Content is unchanged -- still the t.legal.* terms*
// strings, already translated in en/es/fr -- only the page shell changed.
export default function TermsOfServicePage() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {t.legal.back}
        </Link>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
            <div>
              <h1 className="text-xl font-black text-white">{t.legal.termsTitle}</h1>
              <p className="text-xs text-slate-500 mt-1">{t.legal.effectiveDate}</p>
            </div>

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

            <div className="pt-2 border-t border-slate-800">
              <Link href="/privacy-policy" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                {t.legal.viewPrivacyLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
