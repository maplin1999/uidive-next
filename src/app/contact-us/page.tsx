"use client";

import Link from "next/link";
import { Mail, Instagram } from "lucide-react";
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
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                {t.contactUsPage.eyebrow}
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {t.contactUsPage.heading}
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                {t.contactUsPage.intro}
              </p>
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
                <a href="https://www.facebook.com/uidive" target="_blank" rel="noopener noreferrer" aria-label="UiDive on Facebook" className="text-body hover:text-heading">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 8h3V5h-3c-2.76 0-5 2.24-5 5v2H6v3h3v6h3v-6h3l1-3h-4v-2c0-.55.45-1 1-1Z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="https://www.tiktok.com/@uidive" target="_blank" rel="noopener noreferrer" aria-label="UiDive on TikTok" className="text-body hover:text-heading ms-5">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.1V2h-3.45v13.8a2.9 2.9 0 1 1-2.9-2.9c.3 0 .59.05.86.13v-3.52a6.4 6.4 0 1 0 5.49 6.33V8.86a8.25 8.25 0 0 0 4.82 1.55V6.96c-.36 0-.71-.09-1.05-.27Z" />
                  </svg>
                  <span className="sr-only">TikTok</span>
                </a>
                <a href="https://www.instagram.com/uidive" target="_blank" className="text-body hover:text-heading ms-5">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="https://x.com/uidive" target="_blank" className="text-body hover:text-heading ms-5">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.963 6.817H1.684l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                  </svg>
                  <span className="sr-only">X</span>
                </a>
                <a href="https://discord.com/uidive" target="_blank" className="text-body hover:text-heading ms-5">
                  <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.54 4.56A16.84 16.84 0 0 0 15.37 3.25l-.51 1.04a15.7 15.7 0 0 0-5.72 0L8.63 3.25a16.84 16.84 0 0 0-4.17 1.31C1.82 8.77 1.1 12.77 1.46 16.71a16.87 16.87 0 0 0 5.1 2.6l1.23-1.67a10.08 10.08 0 0 1-1.94-.94l.47-.36c3.74 1.73 7.79 1.73 11.49 0l.48.36c-.62.37-1.27.69-1.95.94l1.23 1.67a16.86 16.86 0 0 0 5.1-2.6c.43-4.58-.74-8.54-3.13-12.15ZM8.85 14.25c-1.1 0-2-.99-2-2.21s.88-2.22 2-2.22 2.02.99 2 2.22c0 1.22-.89 2.21-2 2.21Zm6.3 0c-1.1 0-2-.99-2-2.21s.88-2.22 2-2.22 2.02.99 2 2.22c0 1.22-.89 2.21-2 2.21Z" />
                  </svg>
                  <span className="sr-only">Discord</span>
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
