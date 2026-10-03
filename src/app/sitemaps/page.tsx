"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Building2, Scale } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New, user-facing site map -- distinct from src/app/sitemap.ts, which is
// the machine-readable XML sitemap for search crawlers. This page mirrors
// Footer.tsx's own Explore/Company/Legal grouping so the two never drift
// apart in what they list.
//
// Structure matches about-us/page.tsx's own section rhythm: Hero, a banded
// section with a centered intro + icon-badge card grid (Mission's shape,
// one card per footer group), and a closing muted-gradient CTA card
// cross-linking to Contact Us.
export default function SitemapsPage() {
  const { t } = useLocale();

  const groups = [
    {
      icon: Compass,
      color: "cyan" as const,
      title: t.sitemapsPage.exploreHeading,
      links: [
        { href: "/", label: t.footer.findDiveTrips },
        { href: "/community", label: t.footer.community },
        { href: "/diveshop", label: t.footer.diveShop },
        { href: "/host-dashboard", label: t.footer.becomeHost },
      ],
    },
    {
      icon: Building2,
      color: "emerald" as const,
      title: t.sitemapsPage.companyHeading,
      links: [
        { href: "/about-us", label: t.footer.aboutUs },
        { href: "/faqs", label: t.footer.faqs },
        { href: "/contact-us", label: t.footer.contactUs },
        { href: "/sitemaps", label: t.footer.sitemaps },
      ],
    },
    {
      icon: Scale,
      color: "violet" as const,
      title: t.sitemapsPage.legalHeading,
      links: [
        { href: "/terms-of-service", label: t.footer.termsOfService },
        { href: "/privacy-policy", label: t.footer.privacyPolicy },
        { href: "/dive-safe", label: t.footer.diveSafe },
      ],
    },
  ];

  const badgeClasses = {
    cyan: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/30 text-violet-400",
  };

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
            <ArrowLeft className="w-4 h-4" /> {t.sitemapsPage.back}
          </Link>

          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
              {t.sitemapsPage.eyebrow}
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{t.sitemapsPage.heading}</h1>
            <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg">{t.sitemapsPage.intro}</p>
          </div>
        </div>
      </section>

      {/* Site groups */}
      <section className="bg-slate-900/40 border-y border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {t.sitemapsPage.contentEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{t.sitemapsPage.contentTitle}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-400">{t.sitemapsPage.contentBody}</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {groups.map((group) => {
              const Icon = group.icon;
              const [bg, border, text] = badgeClasses[group.color].split(" ");
              return (
                <article key={group.title} className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${bg} ${border}`}>
                    <Icon className={`w-5 h-5 ${text}`} />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-white">{group.title}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link href={link.href} className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-16 text-center sm:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{t.sitemapsPage.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">{t.sitemapsPage.ctaBody}</p>
          <div className="mt-8">
            <Link
              href="/contact-us"
              className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              {t.sitemapsPage.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
