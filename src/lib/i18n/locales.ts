// Supported UI languages. Keep this list and each translations/<code>.ts
// file in lockstep -- LocaleContext below imports all three directly
// (no dynamic i18n routing/middleware, since most of the app is already
// "use client" pages rather than server components) so a new locale means
// adding both an entry here and a matching dictionary file.
export const SUPPORTED_LOCALES = ["en", "es", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_STORAGE_KEY = "uidive_locale";

// Best-effort mapping from a browser's navigator.language (e.g. "es-MX",
// "fr-CA", "de-DE") to one of our supported locales, for the one-time
// auto-detect on first visit. Anything we don't recognise falls back to
// English rather than guessing.
export function detectLocale(navigatorLanguage: string | undefined): Locale {
  if (!navigatorLanguage) return DEFAULT_LOCALE;
  const base = navigatorLanguage.slice(0, 2).toLowerCase();
  return (SUPPORTED_LOCALES as readonly string[]).includes(base) ? (base as Locale) : DEFAULT_LOCALE;
}
