import { supabase } from "@/lib/supabase";
import { DEFAULT_AVATAR } from "@/lib/auth-types";

// Treasure Chests & Cosmetics (Dive Shop proof of concept), ported from the
// old site's app.js. Visuals live here in TS rather than in the database --
// the DB (see add-treasure-chests.sql and its follow-up expansion scripts)
// only needs to know what exists, its type/tier, and who owns it.
export const TREASURE_CHEST_COST = 150;

export type CosmeticType = "avatar" | "calling_card";
export type CosmeticTier = "common" | "rare" | "epic";

export interface CosmeticItem {
  type: CosmeticType;
  tier: CosmeticTier;
  name: string;
  image: string;
}

export const COSMETIC_TIER_STYLES: Record<
  CosmeticTier,
  { ring: string; chip: string; label: string }
> = {
  common: {
    ring: "border-emerald-400",
    chip: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    label: "Common",
  },
  rare: {
    ring: "border-violet-400",
    chip: "bg-violet-500/20 text-violet-300 border-violet-500/40",
    label: "Rare",
  },
  epic: {
    ring: "border-amber-400",
    chip: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    label: "Epic",
  },
};

// Matches COSMETIC_TIER_STYLES' ring colors (emerald/violet/amber) as an
// "R, G, B" triplet so the chest burst glow/rings/sparks in globals.css can
// tint themselves via rgba(var(--chest-glow-rgb), alpha).
export const CHEST_GLOW_RGB_BY_TIER: Record<CosmeticTier, string> = {
  common: "52, 211, 153",
  rare: "167, 139, 250",
  epic: "251, 191, 36",
};

export const COSMETIC_CATALOG: Record<string, CosmeticItem> = {
  avatar_common_clownfish: { type: "avatar", tier: "common", name: "Clownfish", image: "/assets/cosmetics/avatar-common-clownfish.jpg" },
  avatar_rare_turtle: { type: "avatar", tier: "rare", name: "Sea Turtle", image: "/assets/cosmetics/avatar-rare-turtle.jpg" },
  avatar_epic_whaleshark: { type: "avatar", tier: "epic", name: "Whale Shark", image: "/assets/cosmetics/avatar-epic-whaleshark.jpg" },
  card_common_justaddwater: { type: "calling_card", tier: "common", name: "Just Add Water", image: "/assets/cosmetics/card-common-justaddwater.jpg" },
  card_rare_decostop: { type: "calling_card", tier: "rare", name: "Deco Stop", image: "/assets/cosmetics/card-rare-decostop.jpg" },
  card_epic_apexpredator: { type: "calling_card", tier: "epic", name: "Apex Predator", image: "/assets/cosmetics/card-epic-apexpredator.jpg" },
  avatar_common_parrotfish: { type: "avatar", tier: "common", name: "Parrotfish", image: "/assets/cosmetics/avatar-common-parrotfish.jpg" },
  avatar_rare_mantaray: { type: "avatar", tier: "rare", name: "Manta Ray", image: "/assets/cosmetics/avatar-rare-mantaray.jpg" },
  avatar_epic_hammerhead: { type: "avatar", tier: "epic", name: "Hammerhead Shark", image: "/assets/cosmetics/avatar-epic-hammerhead.jpg" },
  card_common_shallowend: { type: "calling_card", tier: "common", name: "Shallow End", image: "/assets/cosmetics/card-common-shallowend.jpg" },
  card_rare_mantapass: { type: "calling_card", tier: "rare", name: "Manta Pass", image: "/assets/cosmetics/card-rare-mantapass.jpg" },
  card_epic_silenthunter: { type: "calling_card", tier: "epic", name: "Silent Hunter", image: "/assets/cosmetics/card-epic-silenthunter.jpg" },
  avatar_common_butterflyfish: { type: "avatar", tier: "common", name: "Butterflyfish", image: "/assets/cosmetics/avatar-common-butterflyfish.jpg" },
  avatar_common_damselfish: { type: "avatar", tier: "common", name: "Damselfish", image: "/assets/cosmetics/avatar-common-damselfish.jpg" },
  avatar_common_bluetang: { type: "avatar", tier: "common", name: "Blue Tang", image: "/assets/cosmetics/avatar-common-bluetang.jpg" },
  avatar_rare_leatherback: { type: "avatar", tier: "rare", name: "Leatherback Turtle", image: "/assets/cosmetics/avatar-rare-leatherback.jpg" },
  avatar_rare_eagleray: { type: "avatar", tier: "rare", name: "Spotted Eagle Ray", image: "/assets/cosmetics/avatar-rare-eagleray.jpg" },
  avatar_rare_lionfish: { type: "avatar", tier: "rare", name: "Lionfish", image: "/assets/cosmetics/avatar-rare-lionfish.jpg" },
  avatar_epic_giantsquid: { type: "avatar", tier: "epic", name: "Giant Squid", image: "/assets/cosmetics/avatar-epic-giantsquid.jpg" },
  avatar_epic_spermwhale: { type: "avatar", tier: "epic", name: "Sperm Whale", image: "/assets/cosmetics/avatar-epic-spermwhale.jpg" },
  avatar_epic_reefshark: { type: "avatar", tier: "epic", name: "Reef Shark", image: "/assets/cosmetics/avatar-epic-reefshark.jpg" },
  card_common_sharkpatrol: { type: "calling_card", tier: "common", name: "Shark Patrol", image: "/assets/cosmetics/card-common-sharkpatrol.jpg" },
  card_common_homesweetanemone: { type: "calling_card", tier: "common", name: "Home Sweet Anemone", image: "/assets/cosmetics/card-common-homesweetanemone.jpg" },
  card_common_reefcruiser: { type: "calling_card", tier: "common", name: "Reef Cruiser", image: "/assets/cosmetics/card-common-reefcruiser.jpg" },
  card_rare_wingspan: { type: "calling_card", tier: "rare", name: "Wingspan", image: "/assets/cosmetics/card-rare-wingspan.jpg" },
  card_rare_masterofdisguise: { type: "calling_card", tier: "rare", name: "Master of Disguise", image: "/assets/cosmetics/card-rare-masterofdisguise.jpg" },
  card_rare_sunkensecrets: { type: "calling_card", tier: "rare", name: "Sunken Secrets", image: "/assets/cosmetics/card-rare-sunkensecrets.jpg" },
  card_epic_barracudavortex: { type: "calling_card", tier: "epic", name: "Barracuda Vortex", image: "/assets/cosmetics/card-epic-barracudavortex.jpg" },
  card_epic_thewall: { type: "calling_card", tier: "epic", name: "The Wall", image: "/assets/cosmetics/card-epic-thewall.jpg" },
  card_epic_abyssalgiant: { type: "calling_card", tier: "epic", name: "Abyssal Giant", image: "/assets/cosmetics/card-epic-abyssalgiant.jpg" },
};

// Renders "the right photo" for any avatar slot: the equipped cosmetic
// avatar's art if one is set, otherwise the real photo/DEFAULT_AVATAR --
// same resolution rule everywhere a diver's avatar shows (feed, chat,
// leaderboard, roster, buddies list, search results).
export function resolveAvatarUrl(
  avatarUrl: string | null | undefined,
  equippedAvatarId: string | null | undefined
): string {
  const item = equippedAvatarId ? COSMETIC_CATALOG[equippedAvatarId] : null;
  if (item && item.type === "avatar") return item.image;
  return avatarUrl || DEFAULT_AVATAR;
}

export async function fetchMyCosmetics(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from("user_cosmetics").select("item_id").eq("user_id", userId);
  if (error) throw error;
  return new Set((data || []).map((r) => r.item_id as string));
}

export interface ChestResult {
  item_id: string;
  item_type: CosmeticType;
  item_tier: CosmeticTier;
  item_name: string;
  is_duplicate: boolean;
  corals_refunded: number;
}

export async function openTreasureChest(): Promise<ChestResult[]> {
  const { data, error } = await supabase.rpc("open_treasure_chest");
  if (error) throw error;
  return data || [];
}

export async function equipCosmetic(itemId: string): Promise<void> {
  const { error } = await supabase.rpc("equip_cosmetic", { p_item_id: itemId });
  if (error) throw error;
}

export async function unequipCosmetic(type: CosmeticType): Promise<void> {
  const { error } = await supabase.rpc("unequip_cosmetic", { p_type: type });
  if (error) throw error;
}

// The 6 frames of the chest-opening sequence, in order, and how far into the
// animation (ms from the modal opening) each one should appear.
export const CHEST_ANIM_FRAMES = [
  { src: "/assets/chest/chest-1-closed.png", at: 0 },
  { src: "/assets/chest/chest-2-crack.png", at: 500 },
  { src: "/assets/chest/chest-3-ajar.png", at: 640 },
  { src: "/assets/chest/chest-4-wide.png", at: 780 },
  { src: "/assets/chest/chest-5-wider.png", at: 920 },
  { src: "/assets/chest/chest-6-open.png", at: 1050 },
];

// A short, tier-scaled chime for the chest reveal -- synthesized rather
// than an audio file, so there's nothing to fetch and nothing that can fail
// to load. Never throws: sound is a nice-to-have, not something that should
// block the reveal if the browser has no AudioContext.
export function playChestSound(tier: CosmeticTier) {
  try {
    const AudioCtx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const freqBase = tier === "epic" ? 880 : tier === "rare" ? 660 : 440;
    [0, 0.12, 0.24].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freqBase * (1 + i * 0.25);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.35);
    });
  } catch {
    /* fine to lose the sound (unsupported browser, autoplay policy, etc.) */
  }
}
