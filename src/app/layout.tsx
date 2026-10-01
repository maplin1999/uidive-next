import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";
import { SocialProvider } from "@/components/social/SocialContext";
import { PublicProfileModal } from "@/components/social/PublicProfileModal";
import { ReportModal } from "@/components/social/ReportModal";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";

export const metadata: Metadata = {
  title: "UiDive",
  description: "Scuba dive trip booking and community",
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
        <AuthProvider>
          <SocialProvider>
            <Header />
            {children}
            {/* Spacer so page content isn't hidden behind the fixed mobile
                bottom nav -- matches that nav's own height + safe-area pad. */}
            <div className="h-20 md:hidden" aria-hidden="true" />
            <MobileNav />
            <AuthModal />
            <PublicProfileModal />
            <ReportModal />
            <CookieConsentBanner />
          </SocialProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
