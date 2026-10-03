"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  BASE_CURRENCY,
  Currency,
  CURRENCY_RATES_STORAGE_KEY,
  CURRENCY_STORAGE_KEY,
  CURRENCY_SYMBOLS,
  FALLBACK_RATES,
  RATE_CACHE_TTL_MS,
  SUPPORTED_CURRENCIES,
} from "@/lib/currency/currencies";

interface CachedRates {
  fetchedAt: number;
  rates: Record<Currency, number>;
}

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Converts a GBP amount (how every price is stored) into the selected currency. */
  convert: (amountGBP: number) => number;
  /** Converts and formats in one step, e.g. "$124" or "124 €" via Intl. */
  formatPrice: (amountGBP: number) => string;
  ratesLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

function readCachedRates(): CachedRates | null {
  try {
    const raw = localStorage.getItem(CURRENCY_RATES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedRates;
    if (!parsed?.rates?.GBP) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCachedRates(rates: Record<Currency, number>) {
  try {
    const payload: CachedRates = { fetchedAt: Date.now(), rates };
    localStorage.setItem(CURRENCY_RATES_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* storage unavailable */
  }
}

// frankfurter.app is a free, keyless FX-rate API backed by the European
// Central Bank's daily reference rates -- no API key to manage, no request
// quota to hit. We only need GBP/USD/EUR, so one request covers everything.
async function fetchLiveRates(): Promise<Record<Currency, number> | null> {
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${SUPPORTED_CURRENCIES.filter(
        (c) => c !== BASE_CURRENCY
      ).join(",")}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return { GBP: 1, USD: data.rates.USD, EUR: data.rates.EUR };
  } catch {
    return null; // offline, FX API down, or blocked -- caller falls back
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(BASE_CURRENCY);
  const [rates, setRates] = useState<Record<Currency, number>>(FALLBACK_RATES);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved && (SUPPORTED_CURRENCIES as readonly string[]).includes(saved)) {
        setCurrencyState(saved as Currency);
      }
    } catch {
      /* storage unavailable */
    }

    const cached = readCachedRates();
    if (cached) setRates(cached.rates);

    const isStale = !cached || Date.now() - cached.fetchedAt > RATE_CACHE_TTL_MS;
    if (!isStale) {
      setRatesLoading(false);
      return;
    }

    fetchLiveRates().then((live) => {
      if (live) {
        setRates(live);
        writeCachedRates(live);
      }
      // If the fetch failed and we had no cache either, `rates` just stays
      // at FALLBACK_RATES from useState's initial value -- still usable,
      // just not perfectly current.
      setRatesLoading(false);
    });
  }, []);

  function setCurrency(next: Currency) {
    setCurrencyState(next);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }

  function convert(amountGBP: number): number {
    return amountGBP * (rates[currency] ?? 1);
  }

  function formatPrice(amountGBP: number): string {
    const converted = convert(amountGBP);
    // Intl.NumberFormat picks the right symbol placement/spacing per
    // currency+locale automatically (e.g. "€124" vs "124,00 €") rather than
    // us hardcoding CURRENCY_SYMBOLS[currency] + amount everywhere.
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: converted >= 100 ? 0 : 2,
    }).format(converted);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, formatPrice, ratesLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}

export { CURRENCY_SYMBOLS };
