"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Inbox as InboxIcon, Camera, ShoppingBag, Anchor, User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { useInboxBadge } from "@/lib/useInboxBadge";
import { useVerifiedHost } from "@/lib/useVerifiedHost";

// Mobile bottom tab bar (migrated from index.html's #mobile-nav-* buttons /
// .mobile-nav-btn). Hidden on desktop (md:hidden), where the header's own
// nav takes over -- same split as the old site's chrome-nav-strong vs.
// header nav. Only shown once there's actually somewhere for every item to
// go; Inbox/Host are auth-gated the same way the header's desktop links are.
export function MobileNav() {
  const { user } = useAuth();
  const inboxBadge = useInboxBadge();
  const isVerifiedHost = useVerifiedHost();
  const pathname = usePathname();

  return (
    <nav
      className="chrome-nav-strong md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 pt-2 flex items-center justify-around"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <MobileNavLink href="/" icon={<Compass className="w-5 h-5" />} label="Explore" active={pathname === "/"} />
      {user && (
        <MobileNavLink
          href="/inbox"
          icon={<InboxIcon className="w-5 h-5" />}
          label="Inbox"
          active={pathname?.startsWith("/inbox")}
          badge={inboxBadge}
        />
      )}
      <MobileNavLink
        href="/community"
        icon={<Camera className="w-5 h-5" />}
        label="Community"
        active={pathname?.startsWith("/community")}
      />
      <MobileNavLink
        href="/diveshop"
        icon={<ShoppingBag className="w-5 h-5" />}
        label="Dive Shop"
        active={pathname?.startsWith("/diveshop")}
      />
      {isVerifiedHost && (
        <MobileNavLink
          href="/host-dashboard"
          icon={<Anchor className="w-5 h-5" />}
          label="Host"
          active={pathname?.startsWith("/host-dashboard")}
        />
      )}
      {user && (
        <MobileNavLink
          href="/profile"
          icon={<User className="w-5 h-5" />}
          label="Profile"
          active={pathname?.startsWith("/profile")}
        />
      )}
    </nav>
  );
}

function MobileNavLink({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`mobile-nav-btn relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
        active ? "active text-cyan-400 bg-slate-900/80" : "text-slate-400"
      }`}
    >
      {icon}
      <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
      {!!badge && badge > 0 && (
        <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}
