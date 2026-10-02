"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Clock } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { fetchLatestPaymentHold, PaymentHold } from "@/lib/checkout";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 10; // ~20s -- Revolut's webhook almost always lands well under this

// Where Revolut's hosted checkout sends the diver back to, whichever way
// the payment went (see redirect_url in src/lib/revolut.ts). Deliberately
// does NOT trust that landing here means payment succeeded -- the browser
// redirect and the server-to-server webhook are two separate, unordered
// things, and only the webhook (confirm_payment_hold/fail_payment_hold,
// called from src/app/api/revolut/webhook/route.ts) is the real source of
// truth. This page just polls the diver's own most recent payment_holds
// row until it shows a final state, or gives up and tells them to check
// back -- it never flips a booking to confirmed itself.
export default function BookingCompletePage() {
  const { user } = useAuth();
  const [hold, setHold] = useState<PaymentHold | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function poll() {
      try {
        const latest = await fetchLatestPaymentHold(user!.id);
        if (cancelled) return;
        setHold(latest);
        if (latest && latest.status === "pending" && pollCount < MAX_POLLS) {
          timerRef.current = setTimeout(() => setPollCount((c) => c + 1), POLL_INTERVAL_MS);
        }
      } catch (err) {
        console.error("Could not check payment status:", err);
        if (!cancelled) setError(true);
      }
    }

    poll();
    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pollCount]);

  if (!user) {
    return (
      <Centered>
        <p className="text-sm text-slate-400">Sign in to see your booking status.</p>
      </Centered>
    );
  }

  if (error) {
    return (
      <Centered>
        <XCircle className="w-10 h-10 text-rose-400" />
        <p className="text-base font-bold text-white mt-3">Could not check your payment status</p>
        <p className="text-sm text-slate-400 mt-1">
          Your booking may still have gone through -- check{" "}
          <Link href="/profile" className="text-cyan-400 hover:underline">
            My Bookings
          </Link>{" "}
          in a moment.
        </p>
      </Centered>
    );
  }

  if (!hold || (hold.status === "pending" && pollCount >= MAX_POLLS)) {
    return (
      <Centered>
        <Clock className="w-10 h-10 text-amber-400" />
        <p className="text-base font-bold text-white mt-3">Still confirming your payment</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">
          This is taking longer than usual. Your spot is held -- check{" "}
          <Link href="/profile" className="text-cyan-400 hover:underline">
            My Bookings
          </Link>{" "}
          in a minute, or refresh this page.
        </p>
      </Centered>
    );
  }

  if (hold.status === "pending") {
    return (
      <Centered>
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        <p className="text-base font-bold text-white mt-3">Confirming your payment…</p>
        <p className="text-sm text-slate-400 mt-1">Just a moment.</p>
      </Centered>
    );
  }

  if (hold.status === "completed") {
    return (
      <Centered>
        <CheckCircle className="w-12 h-12 text-emerald-400" />
        <p className="text-lg font-black text-white mt-3">Booking confirmed!</p>
        {hold.dive_trips && (
          <p className="text-sm text-slate-400 mt-1">
            {hold.dive_trips.title} · {hold.dive_trips.location}
          </p>
        )}
        <Link
          href="/profile"
          className="mt-5 inline-block px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-colors"
        >
          View My Bookings
        </Link>
      </Centered>
    );
  }

  // 'failed' or 'expired'
  return (
    <Centered>
      <XCircle className="w-10 h-10 text-rose-400" />
      <p className="text-base font-bold text-white mt-3">Payment didn&apos;t go through</p>
      <p className="text-sm text-slate-400 mt-1">
        {hold.status === "expired" ? "That checkout session expired." : "The payment was declined or cancelled."}{" "}
        Your spot wasn&apos;t held -- feel free to try booking again.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-colors"
      >
        Back to Explore
      </Link>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center flex flex-col items-center">{children}</div>
    </main>
  );
}
