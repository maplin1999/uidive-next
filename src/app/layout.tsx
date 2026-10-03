import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { SocialProvider } from "@/components/social/SocialContext";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { CurrencyProvider } from "@/components/currency/CurrencyContext";
import { PublicProfileModal } from "@/components/social/PublicProfileModal";
import { ReportModal } from "@/components/social/ReportModal";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { SITE_URL } from "@/lib/site";

// metadataBase turns every relative Open Graph/Twitter image URL below (and
// on any page that doesn't set its own) into an absolute one -- without it
// Next.js logs a warning and social-preview crawlers can't resolve the
// image at all. Per-page metadata (title/description overrides) lives in
// each route's own page.tsx via Next's metadata export, inheriting this
// template and these OG defaults unless it says otherwise.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "UiDive", template: "%s | UiDive" },
  description: "Scuba dive and freediving trip booking and community",
  openGraph: {
    title: "UiDive",
    description: "Find and book scuba dive and freediving trips, then share them with a community of divers.",
    images: [
      {
        url: "/images/og/card-rare-wingspan.jpg",
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "UiDive",
      },
    ],
    url: "/about",
    type: "website",
    siteName: "UiDive",
    locale: "en_GB",
    alternateLocale: [
      "en_US",
      "en_AU",
      "en_NZ",
      "en_ES",
      "en_FR",
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UiDive",
    description: "Find and book scuba dive and freediving trips, then share them with a community of divers.",
    images: [
      {
        url: "/images/og/card-rare-wingspan.jpg",
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "UiDive",
      },
    ],
    site: "UiDive",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // data-theme defaults to "light" ("Sunlit Coastal") -- the old site's real
  // default for a visitor with nothing saved yet, not dark. The inline
  // script below re-applies a saved choice (if any) before first paint, the
  // same job the old site's own <head> script did, so the page never
  // flashes the wrong theme. suppressHydrationWarning is needed because
  // that script can flip the attribute before React hydrates.
  //
  // AuthProvider + Header + AuthModal live here, at the root, instead of in
  // each page -- every route gets the same signed-in/out chrome and the
  // same sign-in modal for free, matching how the old site had exactly one
  // header and one auth modal shared by every tab.
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('uidive_theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();",
          }}
        />
      </head>
      <body>
        <LocaleProvider>
          <CurrencyProvider>
            <AuthProvider>
              <SocialProvider>
                <Header />
                {children}
                <Footer />
                {/* Spacer so page content (including the footer above) isn't
                    hidden behind the fixed mobile bottom nav -- matches that
                    nav's own height + safe-area pad. */}
                <div className="h-20 md:hidden" aria-hidden="true" />
                <MobileNav />
                <AuthModal />
                <PublicProfileModal />
                <ReportModal />
                <CookieConsentBanner />
              </SocialProvider>
            </AuthProvider>
          </CurrencyProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
