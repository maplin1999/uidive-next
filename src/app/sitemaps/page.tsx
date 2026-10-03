"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New, user-facing site map -- distinct from src/app/sitemap.ts, which is
// the machine-readable XML sitemap for search crawlers. This page mirrors
// Footer.tsx's own Explore/Company/Legal grouping so the two never drift
// apart in what they list.
export default function SitemapsPage() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {t.sitemapsPage.back}
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">{t.sitemapsPage.heading}</h1>
          <p className="text-sm text-slate-400 leading-relaxed">{t.sitemapsPage.intro}</p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 sm:p-8 grid gap-8 sm:grid-cols-3">
          <SitemapColumn
            title={t.sitemapsPage.exploreHeading}
            links={[
              { href: "/", label: t.footer.findDiveTrips },
              { href: "/community", label: t.footer.community },
              { href: "/diveshop", label: t.footer.diveShop },
              { href: "/host-dashboard", label: t.footer.becomeHost },
            ]}
          />
          <SitemapColumn
            title={t.sitemapsPage.companyHeading}
            links={[
              { href: "/about-us", label: t.footer.aboutUs },
              { href: "/faqs", label: t.footer.faqs },
              { href: "/contact-us", label: t.footer.contactUs },
              { href: "/sitemaps", label: t.footer.sitemaps },
            ]}
          />
          <SitemapColumn
            title={t.sitemapsPage.legalHeading}
            links={[
              { href: "/terms-of-service", label: t.footer.termsOfService },
              { href: "/privacy-policy", label: t.footer.privacyPolicy },
              { href: "/dive-safe", label: t.footer.diveSafe },
            ]}
          />
        </div>
      </div>
    </main>
  );
}

function SitemapColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-slate-300 hover:text-cyan-400 transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
