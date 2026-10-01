"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Waves,
  Compass,
  Camera,
  ShoppingBag,
  Anchor,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Pencil,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useToast, Toast } from "@/components/Toast";

// The site-wide header (migrated from index.html's <header>), now shared
// across every page via layout.tsx instead of being one more tab-switched
// section. Nav links only point at pages that actually exist yet -- Inbox,
// Dive Shop, and Host Dashboard join this list as they're migrated, same as
// their matching .auth-signed-in-el / host-nav-el visibility rules did on
// the old site.
//
// The old header also had a light/dark theme toggle. It's left out here on
// purpose: the light ("Sunlit Coastal") theme hasn't been ported to Tailwind
// yet (see tailwind.config.ts), so a toggle with nothing to switch to would
// just be a dead button. It comes back once that theme exists.
export function Header() {
  const { user, openAuthModal, signOut } = useAuth();
  const { message } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-3 group text-left min-w-0 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors shrink-0">
              <Waves className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="hidden sm:flex flex-col justify-center min-w-0">
              <span className="font-black text-xl tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent truncate">
                UiDive
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase leading-none mt-1">
                Scuba &amp; Ocean Travel
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <NavLink href="/" icon={<Compass className="w-4 h-4" />} label="Explore" />
            <NavLink href="/community" icon={<Camera className="w-4 h-4" />} label="Community" />
            <NavLink href="/diveshop" icon={<ShoppingBag className="w-4 h-4" />} label="Dive Shop" />
            {user && (
              <NavLink href="/host-dashboard" icon={<Anchor className="w-4 h-4" />} label="Host" />
            )}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {user && (
              <Link
                href="/diveshop"
                className="shrink-0 flex items-center space-x-1.5 sm:space-x-2 bg-amber-500/10 border border-amber-500/30 px-2.5 sm:px-3.5 py-2.5 rounded-full hover:bg-amber-500/20 transition-all"
              >
                <span className="text-base">🪸</span>
                <span className="text-sm font-bold text-amber-400">{user.corals}</span>
                <span className="hidden sm:inline text-xs font-bold text-amber-400">Corals</span>
              </Link>
            )}

            {!user && (
              <button
                onClick={() => openAuthModal("signin")}
                className="shrink-0 whitespace-nowrap flex items-center space-x-1.5 sm:space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 sm:px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-cyan-500/20"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Log in</span>
              </button>
            )}

            {user && (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen((v) => !v);
                  }}
                  className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 p-1.5 pr-3 rounded-full transition-colors"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatar}
                    alt="Your profile photo"
                    className="w-8 h-8 rounded-full object-cover"
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
                        Account
                      </span>
                      <Link
                        href="/profile"
                        onClick={() => setDropdownOpen(false)}
                        aria-label="Edit profile"
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
                      <User className="w-3.5 h-3.5" /> Profile
                    </Link>
                    <div className="border-t border-slate-800" />
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <Toast message={message} />
    </>
  );
}

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="nav-btn px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors flex items-center space-x-2"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
