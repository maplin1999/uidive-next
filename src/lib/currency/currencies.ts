// All prices in the database (dive_trips.price, bookings.price_paid, shop
// vouchers, etc.) are stored in GBP -- that was the original site's only
// currency and migrating stored amounts isn't needed, since we only need to
// convert *for display* at the last possible moment, using a live rate.
export const BASE_CURRENCY = "GBP" as const;

export const SUPPORTED_CURRENCIES = ["GBP", "USD", "EUR"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
};

export const CURRENCY_LABELS: Record<Currency, string> = {
  GBP: "GBP — British Pound",
  USD: "USD — US Dollar",
  EUR: "EUR — Euro",
};

export const CURRENCY_STORAGE_KEY = "uidive_currency";
export const CURRENCY_RATES_STORAGE_KEY = "uidive_currency_rates";

// Rates are refetched at most this often (ms). Exchange rates move slowly
// enough that a fresh fetch per page load would be wasteful, and
// frankfurter.app (see CurrencyContext) only updates once a day anyway.
export const RATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

// Fallback rates used only if the live fetch fails AND nothing is cached
// yet (e.g. first visit with the FX API unreachable) -- approximate,
// infrequently-updated figures so currency switching still *works*, just
// without full precision, rather than the whole feature breaking.
export const FALLBACK_RATES: Record<Currency, number> = {
  GBP: 1,
  USD: 1.27,
  EUR: 1.17,
};
