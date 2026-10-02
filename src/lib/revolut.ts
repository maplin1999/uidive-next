// Server-only client for Revolut's Merchant API (Hosted Checkout Page
// flow). Never imported by a "use client" component -- it reads the
// account's Secret API key from a non-NEXT_PUBLIC_ env var, which must
// never reach the browser. Only src/app/api/revolut/* route handlers
// (which run server-side on Vercel) should import this.
//
// Docs: https://developer.revolut.com/docs/guides/merchant/accept-payments/online-payments/hosted-checkout-page/api
// Sandbox base: https://sandbox-merchant.revolut.com/api
// Production base: https://merchant.revolut.com/api

const REVOLUT_SECRET_KEY = process.env.REVOLUT_SECRET_KEY;
const REVOLUT_API_BASE =
  process.env.REVOLUT_API_BASE_URL ||
  (process.env.REVOLUT_ENV === "production"
    ? "https://merchant.revolut.com/api"
    : "https://sandbox-merchant.revolut.com/api");
// Pinned to a known-good version rather than left to drift -- Revolut
// requires this header on versioned operations and errors without it.
const REVOLUT_API_VERSION = "2026-08-17";

function assertConfigured() {
  if (!REVOLUT_SECRET_KEY) {
    throw new Error(
      "REVOLUT_SECRET_KEY is not set. Add it (and REVOLUT_WEBHOOK_SECRET) to your server env vars -- " +
        "see the setup notes after add-revolut-payments.sql."
    );
  }
}

async function revolutFetch(path: string, init: RequestInit) {
  assertConfigured();
  const res = await fetch(`${REVOLUT_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${REVOLUT_SECRET_KEY}`,
      "Content-Type": "application/json",
      "Revolut-Api-Version": REVOLUT_API_VERSION,
      ...init.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Revolut API ${path} failed (${res.status}): ${body.slice(0, 500)}`);
  }
  return res.json();
}

export interface RevolutOrder {
  id: string;
  token: string;
  checkout_url: string;
  state: string;
  amount: number;
  currency: string;
}

// Amount is in the currency's MINOR unit (pence for GBP), matching
// Revolut's API -- callers pass a decimal price (e.g. 65.00) and this
// converts it, so nowhere else in the app has to think in pence.
export async function createRevolutOrder(opts: {
  priceDecimal: number;
  currency: string;
  description: string;
  customerEmail?: string;
  redirectUrl: string;
  reference: string;
  holdMinutes: number;
}): Promise<RevolutOrder> {
  const amountMinor = Math.round(opts.priceDecimal * 100);
  return revolutFetch("/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: amountMinor,
      currency: opts.currency,
      description: opts.description,
      redirect_url: opts.redirectUrl,
      customer: opts.customerEmail ? { email: opts.customerEmail } : undefined,
      merchant_order_data: { reference: opts.reference },
      // Matches the same hold window the booking's payment_holds row uses
      // (see add-revolut-payments.sql) -- Revolut auto-cancels its own
      // order at the same moment we'd otherwise treat the hold as expired,
      // so an abandoned checkout fails fast instead of lingering as
      // "pending" on Revolut's side until someone looks at it.
      expire_pending_after: `PT${opts.holdMinutes}M`,
    }),
  });
}

// Best-effort cleanup for the rare case a Revolut order was created but the
// capacity-checked payment_holds row couldn't be (trip filled up in the
// gap between the two calls). Never block the user-facing error on this --
// the order will auto-expire on its own via expire_pending_after regardless.
export async function cancelRevolutOrder(orderId: string): Promise<void> {
  try {
    await revolutFetch(`/orders/${orderId}/cancel`, { method: "POST" });
  } catch (err) {
    console.error(`Could not cancel abandoned Revolut order ${orderId}:`, err);
  }
}
