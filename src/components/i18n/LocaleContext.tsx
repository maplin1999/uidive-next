"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_LOCALE, Locale, LOCALE_STORAGE_KEY, detectLocale } from "@/lib/i18n/locales";
import en from "@/lib/i18n/translations/en";
import es from "@/lib/i18n/translations/es";
import fr from "@/lib/i18n/translations/fr";
import type { Dictionary } from "@/lib/i18n/translations/en";

const DICTIONARIES: Record<Locale, Dictionary> = { en, es, fr };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Mirrors lib/theme.ts's pattern: read whatever a previous visit saved,
// otherwise auto-detect from the browser once on mount (not during SSR,
// where navigator doesn't exist -- so the server-rendered HTML always
// starts English, same as data-theme starting "light" before the anti-FOUC
// script can run). A real multi-page app would want this decided before
// first paint via middleware/cookies, but this site is almost entirely
// "use client" pages already, so a brief flash to the detected language is
// an acceptable trade-off for not having to restructure routing.
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved === "en" || saved === "es" || saved === "fr") {
        setLocaleState(saved);
        return;
      }
    } catch {
      /* storage unavailable */
    }
    setLocaleState(detectLocale(navigator.language));
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: DICTIONARIES[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

// Throws outside LocaleProvider on purpose, same as useAuth/useSocial --
// a page rendering without the provider is a wiring bug worth surfacing
// immediately rather than silently falling back to raw keys.
export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
