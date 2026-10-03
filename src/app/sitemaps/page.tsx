"use client";

import Link from "next/link";
import { ArrowLeft, Compass, Building2, Scale } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New, user-facing site map -- distinct from src/app/sitemap.ts, which is
// the machine-readable XML sitemap for search crawlers. This page mirrors
// Footer.tsx's own Explore/Company/Legal grouping so the two never drift
// apart in what they list.
//
// Structure matches about-us/page.tsx -- a full-width gradient Hero, then
// a three-card grid in the same icon-badge style as the About Us Mission
// section, one card per footer group, instead of three bare columns
// inside a single card.
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
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {groups.map((group) => {
            const Icon = group.icon;
            const [bg, border, text] = badgeClasses[group.color].split(" ");
            return (
              <article key={group.title} className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${bg} ${border}`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <h2 className="mt-6 text-xl font-bold text-white">{group.title}</h2>
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
      </section>
    </main>
  );
}
