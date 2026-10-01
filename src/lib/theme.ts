// Light ("Sunlit Coastal") / Dark ("Deep Ocean") theme switching, ported
// from the old site's THEME_STORAGE_KEY/initTheme()/toggleTheme(). Light is
// the real default on the old site -- a fresh visitor with nothing saved
// gets "Sunlit Coastal", not dark -- so layout.tsx's anti-FOUC inline
// script and this module both treat "light" as the fallback, not "dark".
export const THEME_STORAGE_KEY = "uidive_theme";
export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : null;
  } catch {
    return null; // storage unavailable (private browsing, blocked, etc.)
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable */
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function readCurrentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
