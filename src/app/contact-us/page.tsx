"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Instagram, Facebook } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New page -- the footer's "Contact Us" link had nowhere to go before this.
// Informational only (no backend form): a support email and the same
// social links already present in about-us/page.tsx's organizationSchema
// (kept here as plain links rather than duplicating structured data).
//
// Structure matches about-us/page.tsx's own section rhythm: Hero, a banded
// section with a centered intro + icon-badge card grid (Mission's shape),
// and a closing muted-gradient CTA card cross-linking to the FAQ.
export default function ContactUsPage() {
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
            <ArrowLeft className="w-4 h-4" /> {t.contactUsPage.back}
          </Link>

          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {t.contactUsPage.eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.contactUsPage.heading}</h1>
            <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg">{t.contactUsPage.intro}</p>
          </div>
        </div>
      </section>

      {/* Ways to reach us */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {t.contactUsPage.contentEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.contactUsPage.contentTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.contactUsPage.contentBody}</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                <Mail className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{t.contactUsPage.emailHeading}</h3>
              <p className="mt-3 leading-7 text-slate-400">{t.contactUsPage.emailBody}</p>
              <a
                href="mailto:support@uidive.com"
                className="mt-4 inline-block text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                support@uidive.com
              </a>
            </article>

            <article className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <Instagram className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white">{t.contactUsPage.socialHeading}</h3>
              <p className="mt-3 leading-7 text-slate-400">{t.contactUsPage.socialBody}</p>
              <div className="mt-4 flex items-center gap-4">
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
                <a href="https://www.facebook.com/uidive" target="_blank" rel="noopener noreferrer" aria-label="UiDive on Facebook" className="text-body hover:text-heading">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 8h3V5h-3c-2.76 0-5 2.24-5 5v2H6v3h3v6h3v-6h3l1-3h-4v-2c0-.55.45-1 1-1Z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
                
              </div>
            </article>
          </div>

          <p className="mt-6 text-xs text-slate-500">{t.contactUsPage.responseTimeNote}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-16 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.contactUsPage.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">{t.contactUsPage.ctaBody}</p>
          <div className="mt-8">
            <Link
              href="/faqs"
              className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              {t.contactUsPage.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
