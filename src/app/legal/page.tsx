"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Migrated from the old site's #tab-legal section (index.html) and its
// switchLegalTab() helper (app.js). Static content, no Supabase/auth
// involved, which is exactly why this page goes first in the migration --
// it's the simplest page to verify the Next.js + Tailwind pipeline against
// real site content before touching anything with data or auth.
type LegalTab = "privacy" | "terms";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<LegalTab>("privacy");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
          <TabButton
            label="Privacy Policy"
            active={activeTab === "privacy"}
            onClick={() => setActiveTab("privacy")}
          />
          <TabButton
            label="Terms of Service"
            active={activeTab === "terms"}
            onClick={() => setActiveTab("terms")}
          />
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          {activeTab === "privacy" ? <PrivacyPolicy /> : <TermsOfService />}
        </div>
      </div>
    </main>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
        active
          ? "bg-cyan-500 text-slate-950"
          : "text-slate-400 hover:text-slate-200"
      }`}
    >
      {label}
    </button>
  );
}

function PrivacyPolicy() {
  return (
    <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
      <div>
        <h1 className="text-xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-1">
          Effective date: September 29, 2026
        </p>
      </div>
      <p>
        This Privacy Policy explains what information UiDive (&quot;we&quot;,
        &quot;us&quot;) collects when you use the UiDive app and website (the
        &quot;Service&quot;), how we use it, and the choices you have.
      </p>

      <h2 className="text-sm font-bold text-white">Information we collect</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong className="text-slate-200">Account information</strong> —
          name, email address, password, certification level, and location
          you provide when you sign up.
        </li>
        <li>
          <strong className="text-slate-200">Profile content</strong> — your
          bio, avatar, dive logs, community posts, comments, and photos you
          choose to share.
        </li>
        <li>
          <strong className="text-slate-200">Booking information</strong> —
          the trips you book, dates, equipment preferences, and payment
          confirmation details (we do not store your full card number —
          payments are processed by our payment provider).
        </li>
        <li>
          <strong className="text-slate-200">Host information</strong> — if
          you apply to host trips, the verification documents and trip
          details you submit.
        </li>
        <li>
          <strong className="text-slate-200">Usage &amp; device data</strong>{" "}
          — basic technical information like your browser type and general
          activity on the Service, so we can keep it working reliably.
        </li>
        <li>
          <strong className="text-slate-200">Cookies</strong> — small pieces
          of data stored in your browser to keep you signed in and remember
          your preferences. See &quot;Cookies&quot; below.
        </li>
      </ul>

      <h2 className="text-sm font-bold text-white">How we use it</h2>
      <p>
        We use your information to operate the Service: creating and
        securing your account, processing bookings, showing you relevant
        trips, enabling community features (posts, comments, likes,
        messaging), communicating with you about your bookings, and
        improving the Service over time. We do not sell your personal
        information.
      </p>

      <h2 className="text-sm font-bold text-white">Cookies</h2>
      <p>
        We use cookies and similar local storage to keep you signed in
        between visits and remember choices like your theme preference. You
        can decline non-essential cookies from the banner shown on your
        first visit; declining may limit some conveniences (like staying
        signed in) but won&apos;t block core browsing.
      </p>

      <h2 className="text-sm font-bold text-white">Sharing</h2>
      <p>
        We share information only with service providers who help us run the
        Service (such as our backend hosting and payment processing
        providers), when required by law, or with your consent — never for
        their own marketing purposes.
      </p>

      <h2 className="text-sm font-bold text-white">Your choices</h2>
      <p>
        You can review and update your profile information at any time from
        your Profile tab. You may request deletion of your account and
        associated data by contacting us at the email below.
      </p>

      <h2 className="text-sm font-bold text-white">Children&apos;s privacy</h2>
      <p>
        The Service is not directed at children under 16, and we do not
        knowingly collect information from them.
      </p>

      <h2 className="text-sm font-bold text-white">Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We&apos;ll update the
        effective date above when we do.
      </p>

      <h2 className="text-sm font-bold text-white">Contact us</h2>
      <p>
        Questions about this policy? Email us at{" "}
        <a
          href="mailto:privacy@uidive.com"
          className="text-cyan-400 hover:underline"
        >
          privacy@uidive.com
        </a>
        .
      </p>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
      <div>
        <h1 className="text-xl font-black text-white">Terms of Service</h1>
        <p className="text-xs text-slate-500 mt-1">
          Effective date: September 29, 2026
        </p>
      </div>
      <p>
        These Terms govern your use of UiDive (the &quot;Service&quot;). By
        creating an account or using the Service, you agree to these Terms.
      </p>

      <h2 className="text-sm font-bold text-white">Your account</h2>
      <p>
        You&apos;re responsible for keeping your login credentials secure and
        for all activity under your account. You must provide accurate
        information, including a certification level appropriate to the
        trips you book.
      </p>

      <h2 className="text-sm font-bold text-white">
        Bookings &amp; cancellations
      </h2>
      <p>
        When you book a trip through UiDive, you&apos;re entering an
        agreement with the dive operator or host running that trip.
        Cancellation terms, refund eligibility, and rescheduling are shown at
        the time of booking. UiDive facilitates the booking and payment but
        is not the dive operator.
      </p>

      <h2 className="text-sm font-bold text-white">Hosting trips</h2>
      <p>
        If you&apos;re approved to host trips, you&apos;re responsible for
        the accuracy of your listings, holding any required certifications
        or licenses to operate dives in your area, and complying with local
        diving safety regulations.
      </p>

      <h2 className="text-sm font-bold text-white">Assumption of risk</h2>
      <p>
        Scuba diving and free diving carry inherent risks, including serious
        injury or death. You participate in any dive trip booked through the
        Service at your own risk, and are responsible for confirming you
        hold the certification and fitness required for a given trip.
      </p>

      <h2 className="text-sm font-bold text-white">Community conduct</h2>
      <p>
        Posts, comments, and messages must not be harassing, hateful,
        fraudulent, or unlawful. We may remove content or suspend accounts
        that violate these Terms.
      </p>

      <h2 className="text-sm font-bold text-white">Corals &amp; vouchers</h2>
      <p>
        Corals are a loyalty point awarded for activity on the Service and
        have no cash value. Vouchers redeemed with Corals are subject to the
        terms shown at redemption and may not be resold.
      </p>

      <h2 className="text-sm font-bold text-white">
        Disclaimer &amp; limitation of liability
      </h2>
      <p>
        The Service is provided &quot;as is.&quot; To the fullest extent
        permitted by law, UiDive is not liable for indirect or consequential
        damages arising from your use of the Service or participation in any
        trip booked through it.
      </p>

      <h2 className="text-sm font-bold text-white">Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continuing to use the
        Service after a change means you accept the updated Terms.
      </p>

      <h2 className="text-sm font-bold text-white">Contact us</h2>
      <p>
        Questions about these Terms? Email us at{" "}
        <a
          href="mailto:support@uidive.com"
          className="text-cyan-400 hover:underline"
        >
          support@uidive.com
        </a>
        .
      </p>
    </div>
  );
}
