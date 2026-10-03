"use client";

import Link from "next/link";
import { Waves } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Site-wide footer, shared across every page via layout.tsx the same way
// Header is -- the old vanilla site never had a real footer (just the tab
// bar), so this is new rather than migrated. Needs "use client" (unlike
// its original server-component form) now that it reads translated text
// via useLocale, which depends on localStorage/navigator and so can only
// resolve client-side.
export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
          {/* BRAND */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <Link href="/" className="flex items-center space-x-2.5 group w-fit">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors shrink-0">
                <Waves className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                UiDive
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{t.footer.tagline}</p>
          </div>

          {/* EXPLORE */}
          <FooterColumn title={t.footer.explore}>
            <FooterLink href="/">{t.footer.findDiveTrips}</FooterLink>
            <FooterLink href="/community">{t.footer.community}</FooterLink>
            <FooterLink href="/diveshop">{t.footer.diveShop}</FooterLink>
            <FooterLink href="/host-dashboard">{t.footer.becomeHost}</FooterLink>
          </FooterColumn>

          {/* COMPANY */}
          <FooterColumn title={t.footer.company}>
            <FooterLink href="/about-us">{t.footer.aboutUs}</FooterLink>
            <FooterLink href="/faqs">{t.footer.faqs}</FooterLink>
            <FooterLink href="/contact-us">{t.footer.contactUs}</FooterLink>
            <FooterLink href="/sitemaps">{t.footer.sitemaps}</FooterLink>
          </FooterColumn>

          {/* LEGAL */}
          <FooterColumn title={t.footer.legal}>
            <FooterLink href="/terms-of-service">{t.footer.termsOfService}</FooterLink>
            <FooterLink href="/privacy-policy">{t.footer.privacyPolicy}</FooterLink>
            <FooterLink href="/dive-safe">{t.footer.diveSafe}</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            © {year} UiDive. {t.footer.rights}
          </p>
          <p className="text-[11px] text-slate-500">{t.footer.madeForDivers}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
        {children}
      </Link>
    </li>
  );
}
