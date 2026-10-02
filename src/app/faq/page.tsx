"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";

// New page -- no FAQ existed on the old vanilla site. Questions are drawn
// from how the app actually works (Revolut checkout + hold expiry, dive
// logs, Corals, hosting) rather than generic boilerplate, so this stays
// accurate as those features change rather than becoming stale copy.
type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  {
    q: "How do I book a dive trip?",
    a: "Find a trip from the Explore page, pick your equipment on the checklist, then confirm. You'll be taken to a secure Revolut checkout to pay -- your spot is held for 15 minutes while you complete payment.",
  },
  {
    q: "Is my payment secure?",
    a: "Yes -- payments are processed by Revolut, not by UiDive directly. We never see or store your card details.",
  },
  {
    q: "What happens if I don't finish paying in time?",
    a: "Your held spot is automatically released after 15 minutes so other divers can book it, and no charge is made. You're welcome to start the booking again.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes, from My Bookings on your Profile page. Check the trip's listing or contact the host for that trip's specific cancellation and refund terms.",
  },
  {
    q: "What's the Dive Log for?",
    a: "Your Dive Log is a personal record of every dive you've logged -- site, date, conditions, equipment, and notes. It also powers the \"Dives\" count on your public profile.",
  },
  {
    q: "What are Corals?",
    a: "Corals are UiDive's in-app rewards, earned by completing booked dives. Spend them in the Dive Shop on cosmetic avatars and Calling Cards for your profile.",
  },
  {
    q: "How do I become a host and list a trip?",
    a: "Open Become a Host from your account menu to apply. Once verified, you'll get access to the Host Dashboard to create and manage your own dive trips.",
  },
  {
    q: "I found a bug or have a feature request -- who do I tell?",
    a: "We'd love to hear it -- reach out any time at support@uidive.com.",
  },
];

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Frequently Asked Questions</h1>
          <p className="text-sm text-slate-400">
            Can&apos;t find what you&apos;re looking for?{" "}
            <a href="mailto:support@uidive.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Contact us
            </a>
            .
          </p>
        </div>

        <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl divide-y divide-slate-800 overflow-hidden">
          {FAQS.map((item, i) => {
            const open = openIndex === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-sm font-bold text-white">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="px-5 sm:px-6 pb-4 -mt-1">
                    <p className="text-xs text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
