"use client";

import { CosmeticItem } from "@/lib/cosmetics";

// Ported from the old site's cosmeticThumbnailHtml() -- avatars crop to a
// circle (they're used in the same slot as a profile photo when equipped),
// calling cards crop to a rounded rectangle (they're landscape banner art,
// a circle crop would cut off the subject).
export function CosmeticThumbnail({
  item,
  sizeClass,
}: {
  item: CosmeticItem;
  sizeClass: string;
}) {
  const shapeClass = item.type === "avatar" ? "rounded-full" : "rounded-lg";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.image}
      alt={item.name}
      className={`${sizeClass} ${shapeClass} object-cover mx-auto max-w-full`}
    />
  );
}
