"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { CosmeticThumbnail } from "@/components/CosmeticThumbnail";
import {
  CHEST_ANIM_FRAMES,
  CHEST_GLOW_RGB_BY_TIER,
  COSMETIC_CATALOG,
  COSMETIC_TIER_STYLES,
  ChestResult,
  CosmeticTier,
  playChestSound,
} from "@/lib/cosmetics";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useLocale } from "@/components/i18n/LocaleContext";

const TIER_RANK: Record<CosmeticTier, number> = { common: 0, rare: 1, epic: 2 };

// Ported from the old site's #chest-open-modal / showChestOpenModal() --
// steps a real frame-by-frame chest image sequence (not a CSS-drawn box),
// then once it lands fully open plays a glow/flash/ring/spark burst (see
// the .chest-* rules in globals.css) tinted to the best reward's tier,
// before revealing the 3 rewards in a staggered grid.
export function ChestOpenModal({
  results,
  onClose,
}: {
  results: ChestResult[];
  onClose: () => void;
}) {
  const { t } = useLocale();
  const [frameIdx, setFrameIdx] = useState(0);
  const [anticipating, setAnticipating] = useState(true);
  const [framePop, setFramePop] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [rewardsVisible, setRewardsVisible] = useState(false);
  const soundPlayed = useRef(false);

  const bestTier = results.reduce<CosmeticTier>(
    (best, r) => (TIER_RANK[r.item_tier] > TIER_RANK[best] ? r.item_tier : best),
    "common"
  );
  const glowRgb = CHEST_GLOW_RGB_BY_TIER[bestTier] || CHEST_GLOW_RGB_BY_TIER.epic;

  useEscapeClose(onClose);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    CHEST_ANIM_FRAMES.slice(1).forEach((frame, i) => {
      timers.push(
        setTimeout(() => {
          if (i === 0) setAnticipating(false); // rattle stops right as it starts actually opening
          setFrameIdx(i + 1);
          setFramePop(false);
          requestAnimationFrame(() => setFramePop(true));
        }, frame.at)
      );
    });

    timers.push(
      setTimeout(() => {
        setChestOpen(true);
        if (!soundPlayed.current) {
          soundPlayed.current = true;
          playChestSound(bestTier);
        }
      }, 1050)
    );

    timers.push(
      setTimeout(() => {
        setRewardsVisible(true);
      }, 1450) // gives the flash/rings/sparks (triggered at 1050ms) room to play out first
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative bg-slate-900 border border-purple-500/30 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl text-center">
        <button
          type="button"
          onClick={onClose}
          aria-label={t.common.close}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="text-base font-black text-white">{t.chestOpenModal.openingChest}</h3>

        {/* Everything except the chest image itself is pure showmanship
            layered around the real chest artwork -- an idle ambient glow,
            then (once chestOpen flips true) a light flash, two shockwave
            rings and a burst of sparks, all tinted via --chest-glow-rgb to
            match the best reward's tier color. */}
        <div
          id="chest-stage"
          className={`relative h-36 flex items-end justify-center mx-auto ${chestOpen ? "chest-open" : ""}`}
          style={{ ["--chest-glow-rgb" as string]: glowRgb }}
        >
          <div className="chest-ambient-glow" aria-hidden="true" />
          <span className="chest-ring" aria-hidden="true" />
          <span className="chest-ring chest-ring-2" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            id="chest-anim-img"
            src={CHEST_ANIM_FRAMES[frameIdx].src}
            alt={t.chestOpenModal.treasureChestAlt}
            className={`max-h-36 w-auto object-contain drop-shadow-xl ${
              anticipating ? "chest-anticipate" : ""
            } ${framePop ? "chest-frame-pop" : ""}`}
          />
          <div className="chest-sparkles" aria-hidden="true">
            {[
              { dx: "60.2px", dy: "-3.0px", sd: "0.09s" },
              { dx: "64.4px", dy: "35.9px", sd: "0.05s" },
              { dx: "30.8px", dy: "65.9px", sd: "0.01s" },
              { dx: "-16.7px", dy: "55.0px", sd: "0.01s" },
              { dx: "-66.9px", dy: "50.8px", sd: "0.02s" },
              { dx: "-76.7px", dy: "5.9px", sd: "0.13s" },
              { dx: "-54.8px", dy: "-41.7px", sd: "0.14s" },
              { dx: "-36.3px", dy: "-76.9px", sd: "0.04s" },
              { dx: "12.6px", dy: "-57.8px", sd: "0.04s" },
              { dx: "52.6px", dy: "-31.5px", sd: "0.08s" },
            ].map((s, i) => (
              <span
                key={i}
                className="chest-spark"
                style={{ ["--dx" as string]: s.dx, ["--dy" as string]: s.dy, ["--sd" as string]: s.sd }}
              />
            ))}
          </div>
          <div className="chest-flash" aria-hidden="true" />
        </div>

        {rewardsVisible && (
          <div className="grid grid-cols-3 gap-3">
            {results.map((r, i) => {
              const tierStyle = COSMETIC_TIER_STYLES[r.item_tier];
              const catalogItem = COSMETIC_CATALOG[r.item_id];
              return (
                <div
                  key={`${r.item_id}-${i}`}
                  className={`chest-reward-card p-2 sm:p-3 rounded-2xl bg-slate-950 border-2 ${tierStyle.ring} text-center space-y-1`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <div className="mx-auto">
                    {catalogItem ? (
                      <CosmeticThumbnail
                        item={catalogItem}
                        sizeClass={
                          r.item_type === "avatar" ? "w-12 h-12 sm:w-14 sm:h-14" : "w-14 h-10 sm:w-20 sm:h-14"
                        }
                      />
                    ) : (
                      "❓"
                    )}
                  </div>
                  <p className="text-xs font-bold text-white line-clamp-2 leading-tight">{r.item_name}</p>
                  <span
                    className={`inline-block text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${tierStyle.chip}`}
                  >
                    {tierStyle.label}
                  </span>
                  {r.is_duplicate ? (
                    <p className="text-[9px] text-amber-300 font-bold mt-1">
                      {t.chestOpenModal.duplicatePrefix}{r.corals_refunded} 🐚
                    </p>
                  ) : (
                    <p className="text-[9px] text-emerald-400 font-bold mt-1">{t.chestOpenModal.newItem}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {rewardsVisible && (
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs"
          >
            {t.chestOpenModal.addToDiveBag}
          </button>
        )}
      </div>
    </div>
  );
}
