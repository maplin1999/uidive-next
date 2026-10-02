import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRevolutOrder, cancelRevolutOrder } from "@/lib/revolut";
import { SITE_URL } from "@/lib/site";

const HOLD_MINUTES = 15;
const CURRENCY = "GBP";

// Starts a real checkout for a trip: looks the trip up server-side (so the
// price charged can never be something the browser claims), creates a
// Revolut order for that amount, then atomically holds the spot via
// create_payment_hold() (see add-revolut-payments.sql) -- in that order,
// so a hold is never created without a real Revolut order behind it. Called
// from the client by src/lib/checkout.ts right after "Confirm Booking".
export async function POST(req: NextRequest) {
  let body: { tripId?: string; equipment?: Record<string, boolean> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { tripId, equipment } = body;
  if (!tripId) {
    return NextResponse.json({ error: "tripId is required." }, { status: 400 });
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "You must be signed in to book a dive." }, { status: 401 });
  }
  const accessToken = authHeader.slice("Bearer ".length);

  // Scoped to this one request with the diver's own access token attached,
  // so auth.uid() inside create_payment_hold() resolves to them, and RLS
  // applies exactly as if they'd called it from the browser themselves --
  // this route never uses the service role key, it only ever acts as this
  // one signed-in diver.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Your session has expired -- please sign in again." }, { status: 401 });
  }

  const { data: trip, error: tripErr } = await supabase
    .from("dive_trips")
    .select("id, title, price, capacity, spots_booked")
    .eq("id", tripId)
    .maybeSingle();
  if (tripErr || !trip) {
    return NextResponse.json({ error: "This dive trip no longer exists." }, { status: 404 });
  }
  if (trip.spots_booked >= trip.capacity) {
    return NextResponse.json({ error: "This trip is fully booked." }, { status: 409 });
  }

  let order;
  try {
    order = await createRevolutOrder({
      priceDecimal: Number(trip.price),
      currency: CURRENCY,
      description: trip.title,
      customerEmail: user.email,
      redirectUrl: `${SITE_URL}/booking/complete`,
      reference: `trip:${trip.id}:user:${user.id}`,
      holdMinutes: HOLD_MINUTES,
    });
  } catch (err) {
    console.error("Could not create Revolut order:", err);
    return NextResponse.json({ error: "Could not start checkout -- please try again." }, { status: 502 });
  }

  const { data: hold, error: holdErr } = await supabase.rpc("create_payment_hold", {
    p_trip_id: tripId,
    p_equipment: equipment || {},
    p_revolut_order_id: order.id,
    p_checkout_url: order.checkout_url,
    p_hold_minutes: HOLD_MINUTES,
  });

  if (holdErr || !hold) {
    // The Revolut order exists but we couldn't actually hold the spot
    // (most likely: the trip filled up in the moment between the capacity
    // read above and this call). Don't leave an orphaned order sitting on
    // Revolut's side.
    await cancelRevolutOrder(order.id);
    console.error("Could not create payment hold:", holdErr);
    return NextResponse.json(
      { error: holdErr?.message || "Could not reserve this spot -- please try again." },
      { status: 409 }
    );
  }

  return NextResponse.json({ checkoutUrl: order.checkout_url });
}
