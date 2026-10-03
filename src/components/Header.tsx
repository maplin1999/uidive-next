"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Waves,
  Compass,
  Camera,
  ShoppingBag,
  Anchor,
  Inbox as InboxIcon,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Pencil,
  ShieldCheck,
  CalendarCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast, Toast } from "@/components/Toast";
import { useInboxBadge } from "@/lib/useInboxBadge";
import { useVerifiedHost } from "@/lib/useVerifiedHost";
import { AdminPanelModal } from "@/components/admin/AdminPanelModal";
import { CosmeticsLockerModal } from "@/components/shop/CosmeticsLockerModal";
import { BagIcon } from "@/components/icons/BagIcon";
import { Theme, applyTheme, readCurrentTheme, storeTheme } from "@/lib/theme";
import { DiverAvatar } from "@/components/DiverAvatar";
import { useLocale } from "@/components/i18n/LocaleContext";
import { LocalePrefsMenu } from "@/components/i18n/LocalePrefsMenu";

// The site-wide header (migrated from index.html's <header>), now shared
// across every page via layout.tsx instead of being one more tab-switched
// section. Nav links only point at pages that actually exist yet -- Inbox,
// Dive Shop, and Host Dashboard join this list as they're migrated, same as
// their matching .auth-signed-in-el / host-nav-el visibility rules did on
// the old site.
//
// Light ("Sunlit Coastal") / dark ("Deep Ocean") toggle, migrated from the
// old site's theme-toggle-btn/toggleTheme(). Light is the real default --
// layout.tsx's inline anti-FOUC script and lib/theme.ts both fall back to
// it, matching the old site's own index.html default.
export function Header() {
  const { user, loading, openAuthModal, signOut } = useAuth();
  const { t } = useLocale();
  const { message, showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inboxBadge = useInboxBadge();
  const isVerifiedHost = useVerifiedHost();
  const pathname = usePathname();
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);
  const [lockerOpen, setLockerOpen] = useState(false);
  // Mirrors the old site's toggleTheme(): read whatever the anti-FOUC
  // script in layout.tsx already applied, rather than assuming light, so
  // the icon shown here doesn't flash/mismatch on first paint.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readCurrentTheme());
  }, []);

  function handleToggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    storeTheme(next);
    setTheme(next);
    showToast(next === "dark" ? "🌙 Deep Ocean mode" : "☀️ Sunlit Coastal mode");
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      <header className="chrome-header-strong sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center space-x-3 group text-left min-w-0" aria-label="uiDive home">
            <Image
              src="/images/uidive-logo.svg"
              alt="DiveBuddy"
              width={48}
              height={48}
              priority
            />
            <div className="flex flex-col justify-center min-w-0">
              <span className="font-black text-xl sm:text-2xl tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent block pb-1 truncate">
                UiDive
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/" icon={<Compass className="w-4 h-4" />} label={t.nav.explore} active={pathname === "/"} />
            <NavLink
              href="/community"
              icon={<Camera className="w-4 h-4" />}
              label={t.nav.community}
              active={pathname?.startsWith("/community")}
            />
            <NavLink
              href="/diveshop"
              icon={<ShoppingBag className="w-4 h-4" />}
              label={t.nav.diveShop}
              active={pathname?.startsWith("/diveshop")}
            />
            {user && (
              <NavLink
                href="/inbox"
                icon={<InboxIcon className="w-4 h-4" />}
                label={t.nav.inbox}
                badge={inboxBadge}
                active={pathname?.startsWith("/inbox")}
              />
            )}
            {isVerifiedHost && (
              <NavLink
                href="/host-dashboard"
                icon={<Anchor className="w-4 h-4" />}
                label={t.nav.hostDashboard}
                active={pathname?.startsWith("/host-dashboard")}
              />
            )}
          </nav>

          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            <LocalePrefsMenu />
            <button
              onClick={handleToggleTheme}
              title={t.header.switchTheme}
              aria-label={t.header.switchTheme}
              className="theme-toggle-btn shrink-0 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {user && (
              <Link
                href="/diveshop"
                className="shrink-0 flex items-center space-x-1.5 sm:space-x-2 bg-amber-500/10 border border-amber-500/30 px-2.5 sm:px-3.5 py-2.5 rounded-full hover:bg-amber-500/20 transition-all min-h-[44px]"
              >
                <span className="text-base">🪸</span>
                <span className="text-sm font-bold text-amber-400">{Number(user.corals).toLocaleString()}</span>
                <span className="hidden sm:inline text-xs font-bold text-amber-400">{t.header.corals}</span>
              </Link>
            )}

            {/* Ported from the old site's "auth-checking" CSS fix: while
                restoreSession() is still asking Supabase whether a session
                exists, `user` reads as null just like the signed-out state,
                so without this guard every refresh -- even for an
                already-signed-in diver -- would flash the Log In button
                for a moment before flipping to the real state. Hiding both
                variants until loading resolves avoids that flash/pop. */}
            {!loading && !user && (
              <button
                onClick={() => openAuthModal("signin")}
                className="shrink-0 whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 sm:px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-cyan-500/20 min-h-[44px]"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>{t.header.logIn}</span>
              </button>
            )}

            {user && (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((v) => !v);
                  }}
                  className="flex items-center justify-center sm:justify-start space-x-2 bg-slate-900 hover:bg-slate-800 sm:border sm:border-slate-800 p-1.5 sm:pr-3 rounded-full transition-colors min-h-[44px] min-w-[44px]"
                >
                  <DiverAvatar
                    avatarUrl={user.avatar}
                    equippedAvatarId={user.equipped_avatar_id}
                    cert={user.cert}
                    isVerifiedHost={isVerifiedHost}
                    sizeClass="w-8 h-8"
                    alt={t.profile.yourProfilePhoto}
                  />
                  <span className="text-xs font-bold text-slate-200 hidden sm:inline">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden sm:inline" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {t.header.account}
                      </span>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        aria-label={t.header.editProfile}
                        className="p-1.5 -mr-1.5 rounded-full text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" /> {t.nav.profile}
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <CalendarCheck className="w-3.5 h-3.5" /> {t.header.myBookings}
                    </Link>
                    {/* Treasure Chest cosmetics locker -- moved here from the
                        profile header's own "Locker" button so it's reachable
                        from any page, not just /profile. Renamed "My Dive Bag"
                        to read better as a dropdown item. */}
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setLockerOpen(true);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                    >
                      <BagIcon className="w-3.5 h-3.5" /> {t.header.myDiveBag}
                    </button>
                    {!isVerifiedHost && (
                      <Link
                        href="/host-dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <Anchor className="w-3.5 h-3.5" /> {t.header.becomeHost}
                      </Link>
                    )}
                    {user.is_admin && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          setAdminPanelOpen(true);
                        }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-violet-300 hover:bg-slate-800 transition-colors flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> {t.header.adminPanel}
                      </button>
                    )}
                    <div className="border-t border-slate-800" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> {t.header.logOut}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <Toast message={message} />
      {adminPanelOpen && <AdminPanelModal onClose={() => setAdminPanelOpen(false)} />}
      {lockerOpen && <CosmeticsLockerModal onClose={() => setLockerOpen(false)} />}
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
  badge,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`nav-btn relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center space-x-2 ${
        active ? "active text-cyan-400 bg-slate-900/80" : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
      }`}
    >
      {icon}
      <span>{label}</span>
      {!!badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
