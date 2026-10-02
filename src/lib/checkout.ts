import { supabase } from "@/lib/supabase";

export interface PaymentHold {
  id: string;
  trip_id: string;
  price: number;
  currency: string;
  status: "pending" | "completed" | "failed" | "expired";
  booking_id: string | null;
  created_at: string;
  expires_at: string;
  dive_trips: { title: string; location: string } | null;
}

// Starts a real Revolut checkout for a trip -- replaces the old free,
// instant bookTrip() RPC call. Posts to our own /api/revolut/create-order
// route (never calls Revolut directly from the browser, which would mean
// shipping the Secret API key to every visitor), which looks the trip's
// real price up server-side, creates the Revolut order, and atomically
// holds the spot. The caller is responsible for redirecting the browser to
// the returned checkoutUrl -- see DiveDetailModal's handleFinalize().
export async function startCheckout(
  tripId: string,
  equipment: Record<string, boolean>
): Promise<{ checkoutUrl: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("You must be signed in to book a dive.");
  }

  const res = await fetch("/api/revolut/create-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ tripId, equipment }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Could not start checkout -- please try again.");
  }
  return data;
}

// Powers the /booking/complete return page: Revolut's own redirect lands
// the diver back on the site well before the webhook is guaranteed to have
// arrived and been processed, so that page polls this instead of trusting
// the redirect itself -- see its own comment for why that distinction
// matters. Looks up the signed-in diver's own most recent hold via RLS
// (payment_holds' select policy is "auth.uid() = user_id"), not a specific
// order id, since Revolut's redirect query params aren't depended on here.
export async function fetchLatestPaymentHold(userId: string): Promise<PaymentHold | null> {
  const { data, error } = await supabase
    .from("payment_holds")
    .select("id, trip_id, price, currency, status, booking_id, created_at, expires_at, dive_trips(title, location)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as PaymentHold | null;
}
