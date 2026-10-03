"use client";

import { X } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// Full-size photo viewer, ported from the old site's #image-lightbox-modal /
// openImageLightbox(). object-contain + no max-height crop means a tall
// portrait or ultra-wide photo shows at its real aspect ratio instead of
// the feed card's cropped preview box.
export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const { t } = useLocale();
  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label={t.common.close}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white z-10"
      >
        <X className="w-4 h-4" />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={t.imageLightbox.fullSizePhotoAlt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
      />
    </div>
  );
}
