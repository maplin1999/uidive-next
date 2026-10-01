"use client";

import { DEFAULT_AVATAR } from "@/lib/auth-types";
import { COSMETIC_CATALOG } from "@/lib/cosmetics";
import { diverCertRingClass } from "@/lib/diverRing";

// Renders any diver's avatar slot: their equipped cosmetic avatar image if
// they have one, otherwise their real photo/DEFAULT_AVATAR -- ported from
// the old site's cosmeticAvatarHtml(). The ring color reflects
// certification level / verified-host status either way, so an equipped
// cosmetic never hides that signal.
export function DiverAvatar({
  avatarUrl,
  equippedAvatarId,
  cert,
  isVerifiedHost,
  sizeClass = "w-10 h-10",
  borderClass = "border-2",
  className = "",
  alt = "",
}: {
  avatarUrl: string | null | undefined;
  equippedAvatarId?: string | null;
  cert?: string | null;
  isVerifiedHost?: boolean;
  sizeClass?: string;
  /** Border width/shadow utilities -- kept separate from sizeClass/className
      so a caller overriding it (e.g. "border-4 shadow-lg") doesn't end up
      with two conflicting border-width classes in the same string. */
  borderClass?: string;
  className?: string;
  alt?: string;
}) {
  const ringClass = diverCertRingClass(cert, isVerifiedHost);
  const item = equippedAvatarId ? COSMETIC_CATALOG[equippedAvatarId] : null;
  const src = item && item.type === "avatar" ? item.image : avatarUrl || DEFAULT_AVATAR;
  const title = item && item.type === "avatar" ? item.name : undefined;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      title={title}
      className={`${sizeClass} rounded-full object-cover ${borderClass} ${ringClass} shrink-0 ${className}`}
    />
  );
}
