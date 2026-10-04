"use client";

import Image from "next/image";
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
              <Image
                src="/assets/images/uidive-logo.svg"
                alt="UiDive"
                width={48}
                height={48}
                priority
              />
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                UiDive
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">{t.footer.tagline}</p>
            {/* SOCIAL MEDIA */}
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="flex mt-4 sm:justify-center sm:mt-0">
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
            </div>

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
            <FooterLink href="/contact-us">{t.footer.contactUs}</FooterLink>
            <FooterLink href="/faqs">{t.footer.faqs}</FooterLink>
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
