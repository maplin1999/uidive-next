"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Split out of the old combined /legal page -- see terms-of-service/page.tsx
// for the matching Terms route and the reasoning. Content is unchanged,
// still the t.legal.* privacy* strings already translated in en/es/fr.
export default function PrivacyPolicyPage() {
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
              <h1 className="text-xl font-black text-white">{t.legal.privacyTitle}</h1>
              <p className="text-xs text-slate-500 mt-1">{t.legal.effectiveDate}</p>
            </div>

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

            <div className="pt-2 border-t border-slate-800">
              <Link href="/terms-of-service" className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                {t.legal.viewTermsLink}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
