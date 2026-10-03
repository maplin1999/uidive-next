"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";
import type { Dictionary } from "@/lib/i18n/translations/en";

// Migrated from the old site's #tab-legal section (index.html) and its
// switchLegalTab() helper (app.js). Static content, no Supabase/auth
// involved, which is exactly why this page goes first in the migration --
// it's the simplest page to verify the Next.js + Tailwind pipeline against
// real site content before touching anything with data or auth.
type LegalTab = "privacy" | "terms";

export default function LegalPage() {
  return (
    <Suspense fallback={null}>
      <LegalPageInner />
    </Suspense>
  );
}

// A ?tab=terms query param lets links elsewhere (the auth modal's sign-up
// fine print, same as the old site's openLegalPage('terms')) land straight
// on the Terms tab instead of always defaulting to Privacy.
function LegalPageInner() {
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<LegalTab>(requestedTab === "terms" ? "terms" : "privacy");

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> {t.legal.back}
        </Link>

        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
          <TabButton
            label={t.legal.privacyTab}
            active={activeTab === "privacy"}
            onClick={() => setActiveTab("privacy")}
          />
          <TabButton
            label={t.legal.termsTab}
            active={activeTab === "terms"}
            onClick={() => setActiveTab("terms")}
          />
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          {activeTab === "privacy" ? <PrivacyPolicy t={t} /> : <TermsOfService t={t} />}
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

function PrivacyPolicy({ t }: { t: Dictionary }) {
  return (
    <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
      <div>
        <h1 className="text-xl font-black text-white">{t.legal.privacyTitle}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {t.legal.effectiveDate}
        </p>
      </div>
      <p>
        {t.legal.privacyIntro}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.infoWeCollectHeading}</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong className="text-slate-200">{t.legal.accountInfoLabel}</strong> —{" "}
          {t.legal.accountInfoBody}
        </li>
        <li>
          <strong className="text-slate-200">{t.legal.profileContentLabel}</strong> —{" "}
          {t.legal.profileContentBody}
        </li>
        <li>
          <strong className="text-slate-200">{t.legal.bookingInfoLabel}</strong> —{" "}
          {t.legal.bookingInfoBody}
        </li>
        <li>
          <strong className="text-slate-200">{t.legal.hostInfoLabel}</strong> —{" "}
          {t.legal.hostInfoBody}
        </li>
        <li>
          <strong className="text-slate-200">{t.legal.usageDataLabel}</strong>{" "}
          — {t.legal.usageDataBody}
        </li>
        <li>
          <strong className="text-slate-200">{t.legal.cookiesLabel}</strong> —{" "}
          {t.legal.cookiesListBody}
        </li>
      </ul>

      <h2 className="text-sm font-bold text-white">{t.legal.howWeUseItHeading}</h2>
      <p>
        {t.legal.howWeUseItBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.cookiesHeading}</h2>
      <p>
        {t.legal.cookiesBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.sharingHeading}</h2>
      <p>
        {t.legal.sharingBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.yourChoicesHeading}</h2>
      <p>
        {t.legal.yourChoicesBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.childrensPrivacyHeading}</h2>
      <p>
        {t.legal.childrensPrivacyBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.changesToPolicyHeading}</h2>
      <p>
        {t.legal.changesToPolicyBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.contactUsHeading}</h2>
      <p>
        {t.legal.privacyContactBody}{" "}
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

function TermsOfService({ t }: { t: Dictionary }) {
  return (
    <div className="space-y-5 text-sm text-slate-300 leading-relaxed">
      <div>
        <h1 className="text-xl font-black text-white">{t.legal.termsTitle}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {t.legal.effectiveDate}
        </p>
      </div>
      <p>
        {t.legal.termsIntro}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.yourAccountHeading}</h2>
      <p>
        {t.legal.yourAccountBody}
      </p>

      <h2 className="text-sm font-bold text-white">
        {t.legal.bookingsCancellationsHeading}
      </h2>
      <p>
        {t.legal.bookingsCancellationsBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.hostingTripsHeading}</h2>
      <p>
        {t.legal.hostingTripsBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.assumptionOfRiskHeading}</h2>
      <p>
        {t.legal.assumptionOfRiskBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.communityConductHeading}</h2>
      <p>
        {t.legal.communityConductBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.coralsVouchersHeading}</h2>
      <p>
        {t.legal.coralsVouchersBody}
      </p>

      <h2 className="text-sm font-bold text-white">
        {t.legal.disclaimerHeading}
      </h2>
      <p>
        {t.legal.disclaimerBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.changesToTermsHeading}</h2>
      <p>
        {t.legal.changesToTermsBody}
      </p>

      <h2 className="text-sm font-bold text-white">{t.legal.contactUsHeading}</h2>
      <p>
        {t.legal.termsContactBody}{" "}
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
