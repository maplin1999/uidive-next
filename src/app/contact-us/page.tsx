"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Instagram, Facebook } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New page -- the footer's "Contact Us" link had nowhere to go before this.
// Informational only (no backend form): a support email and the same
// social links already present in about-us/page.tsx's organizationSchema
// (kept here as plain links rather than duplicating structured data).
export default function ContactUsPage() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {t.contactUsPage.back}
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">{t.contactUsPage.heading}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{t.contactUsPage.intro}</p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{t.contactUsPage.emailHeading}</h2>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">{t.contactUsPage.emailBody}</p>
              <a
                href="mailto:support@uidive.com"
                className="mt-2 inline-block text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                support@uidive.com
              </a>
            </div>
          </div>

          <div className="h-px bg-slate-800" />

          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Instagram className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-white">{t.contactUsPage.socialHeading}</h2>
              <p className="mt-1 text-sm text-slate-400 leading-relaxed">{t.contactUsPage.socialBody}</p>
              <div className="mt-3 flex items-center gap-4">
                <a
                  href="https://www.instagram.com/uidive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
                <a
                  href="https://www.facebook.com/uidive"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-cyan-400 transition-colors"
                >
                  <Facebook className="w-4 h-4" /> Facebook
                </a>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">{t.contactUsPage.responseTimeNote}</p>
        </div>
      </div>
    </main>
  );
}
