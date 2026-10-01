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
  // data-theme starts as "dark" to match the old site's default; the real
  // theme-toggle button (with its localStorage persistence) comes back once
  // the light theme is ported (see Header.tsx's comment on this).
  //
  // AuthProvider + Header + AuthModal live here, at the root, instead of in
  // each page -- every route gets the same signed-in/out chrome and the
  // same sign-in modal for free, matching how the old site had exactly one
  // header and one auth modal shared by every tab.
  return (
    <html lang="en" data-theme="dark">
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
