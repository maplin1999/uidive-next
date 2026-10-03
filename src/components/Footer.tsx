import Link from "next/link";
import { Waves, Mail } from "lucide-react";

// Site-wide footer, shared across every page via layout.tsx the same way
// Header is -- the old vanilla site never had a real footer (just the tab
// bar), so this is new rather than migrated. Kept as a plain server
// component (no state, no "use client") since it's static on every page.
export function Footer() {
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
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Find dive trips near you, book your spot, and connect with divers who&apos;ve been
              there.
            </p>
          </div>

          {/* EXPLORE */}
          <FooterColumn title="Explore">
            <FooterLink href="/">Find Dive Trips</FooterLink>
            <FooterLink href="/community">Community</FooterLink>
            <FooterLink href="/diveshop">Dive Shop</FooterLink>
            <FooterLink href="/host-dashboard">Become a Host</FooterLink>
          </FooterColumn>

          {/* COMPANY */}
          <FooterColumn title="Company">
            <FooterLink href="/about-us">About Us</FooterLink>
            <FooterLink href="/faqs">FAQ's</FooterLink>
            <FooterLink href="/contact-us">Contact Us</FooterLink>
          </FooterColumn>

          {/* LEGAL */}
          <FooterColumn title="Legal">
            <FooterLink href="/legal?tab=privacy">Privacy Policy</FooterLink>
            <FooterLink href="/legal?tab=terms">Terms of Service</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            © {year} UiDive. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-500">Made for divers, by divers. ♥</p>
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
