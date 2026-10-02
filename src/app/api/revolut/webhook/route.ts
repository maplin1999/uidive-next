import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";

// Revolut's source of truth for whether a checkout actually succeeded --
// never the browser redirect (see src/app/booking/complete/page.tsx's own
// comment on why). This is the ONLY place in the app that uses the
// Supabase service role key: webhooks arrive with no diver session to
// forward, so confirm_payment_hold()/fail_payment_hold() have to be called
// in a context that bypasses RLS entirely, after verifying the request
// really came from Revolut (see verifySignature below).
//
// Register this route's URL (https://<your-domain>/api/revolut/webhook)
// in the Revolut Business dashboard under Webhooks, subscribed to at least
// ORDER_COMPLETED, ORDER_PAYMENT_FAILED, ORDER_PAYMENT_DECLINED and
// ORDER_CANCELLED -- that dashboard screen is also where the signing
// secret (REVOLUT_WEBHOOK_SECRET) comes from.
// Docs: https://developer.revolut.com/docs/guides/manage-accounts/webhooks/verify-the-payload-signature

function verifySignature(rawBody: string, signatureHeader: string | null, timestampHeader: string | null): boolean {
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!secret || !signatureHeader || !timestampHeader) return false;

  const signingString = `v1.${timestampHeader}.${rawBody}`;
  const expected = "v1=" + createHmac("sha256", secret).update(signingString).digest("hex");

  // Revolut-Signature can carry more than one version's signature
  // space-separated; matching any of them (constant-time) is enough.
  const provided = signatureHeader.split(" ");
  const expectedBuf = Buffer.from(expected);
  return provided.some((sig) => {
    const sigBuf = Buffer.from(sig);
    return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
  });
}

function serviceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("revolut-signature");
  const timestamp = req.headers.get("revolut-request-timestamp");

  if (!verifySignature(rawBody, signature, timestamp)) {
    console.error("Revolut webhook: signature verification failed.");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { event?: string; order_id?: string; id?: string };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  // Different Revolut event payloads nest the order id slightly
  // differently depending on event family -- order_id covers the Merchant
  // API order events this route cares about; id is kept as a fallback.
  const orderId = event.order_id || event.id;
  if (!event.event || !orderId) {
    return NextResponse.json({ error: "Missing event or order id." }, { status: 400 });
  }

  const supabase = serviceClient();

  try {
    if (event.event === "ORDER_COMPLETED") {
      const { error } = await supabase.rpc("confirm_payment_hold", { p_revolut_order_id: orderId });
      if (error) throw error;
    } else if (
      event.event === "ORDER_PAYMENT_FAILED" ||
      event.event === "ORDER_PAYMENT_DECLINED" ||
      event.event === "ORDER_CANCELLED"
    ) {
      const { error } = await supabase.rpc("fail_payment_hold", { p_revolut_order_id: orderId });
      if (error) throw error;
    }
    // Any other event type (ORDER_AUTHORISED under manual capture, etc.)
    // is intentionally ignored -- this integration only uses automatic
    // capture, so ORDER_COMPLETED is the only success signal it acts on.
  } catch (err) {
    console.error(`Could not process Revolut webhook (${event.event} for ${orderId}):`, err);
    // Still 200 -- these errors are almost always "hold already resolved"
    // (both RPCs are idempotent) rather than something a Revolut retry
    // would fix, and a non-2xx here just makes Revolut hammer this
    // endpoint with retries for no benefit.
  }

  return NextResponse.json({ received: true });
}
