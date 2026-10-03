"use client";

import Link from "next/link";
import { Handshake, Compass, Waves as WavesIcon, Users, Anchor, Sparkles } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";
import { useAuth } from "@/components/auth/AuthContext";

// Marketing-style About page, restyled to match the rest of the signed-in
// app (slate-950/900 surfaces, cyan-400 accents, rounded-3xl cards) instead
// of the light sections it was first built with -- same six-section
// structure (Hero / Story / Mission / What We Do / Values / CTA), just
// themed consistently with Profile, Host Dashboard, and every other page.
// Metadata/SEO strings (title, description, keywords, schema.org JSON-LD)
// stay in English -- they're consumed by search engines and social
// previews rather than rendered for a logged-in visitor's chosen locale,
// and generateMetadata would need its own server-side locale detection to
// vary them, which this app doesn't do.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UiDive",
  url: "https://www.uidive.com",
  logo: "https://www.uidive.com/logo.png",
  description:
    "UiDive is a platform helping divers find dives, connect with dive buddies, discover diving experiences and explore the underwater world together.",
  sameAs: ["https://www.instagram.com/uidive", "https://www.facebook.com/uidive"],
};

export default function AboutPage() {
  const { t } = useLocale();
  const { user, openAuthModal } = useAuth();

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <main className="bg-slate-950 text-white">

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-slate-950 to-slate-950" />

          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
            <div className="max-w-3xl">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
                {t.aboutUs.eyebrow}
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                {t.aboutUs.heroTitle}
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                {t.aboutUs.heroBody}
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                {t.aboutUs.storyEyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.aboutUs.storyTitle}
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                {t.aboutUs.storyBody1}
              </p>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                {t.aboutUs.storyBody2}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl">
                🤿
              </div>

              <blockquote className="mt-8 text-2xl font-semibold leading-9 text-white">
                &quot;{t.aboutUs.storyQuote}&quot;
              </blockquote>
            </div>

          </div>
        </section>

        {/* Mission */}
        <section className="bg-slate-900/40 border-y border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                {t.aboutUs.missionEyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.aboutUs.missionTitle}
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                {t.aboutUs.missionBody}
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">

              <article className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <Handshake className="w-5 h-5 text-cyan-400" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {t.aboutUs.connectTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.connectBody}
                </p>
              </article>

              <article className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <WavesIcon className="w-5 h-5 text-emerald-400" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {t.aboutUs.discoverTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.discoverBody}
                </p>
              </article>

              <article className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/30">
                  <Compass className="w-5 h-5 text-violet-400" />
                </div>

                <h3 className="mt-6 text-xl font-bold text-white">
                  {t.aboutUs.exploreTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.exploreBody}
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
              {t.aboutUs.whatWeDoEyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.aboutUs.whatWeDoTitle}
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              {t.aboutUs.whatWeDoBody}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[
              { icon: Users, title: t.aboutUs.findBuddiesTitle, text: t.aboutUs.findBuddiesBody },
              { icon: Anchor, title: t.aboutUs.discoverDivesTitle, text: t.aboutUs.discoverDivesBody },
              { icon: Compass, title: t.aboutUs.planAdventuresTitle, text: t.aboutUs.planAdventuresBody },
              { icon: Sparkles, title: t.aboutUs.buildCommunityTitle, text: t.aboutUs.buildCommunityBody },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-2xl bg-slate-900 border border-slate-800 p-6 hover:border-cyan-500/40 transition-colors"
                >
                  <Icon className="w-5 h-5 text-cyan-400" />

                  <h3 className="mt-4 text-lg font-bold text-white">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {item.text}
                  </p>
                </article>
              );
            })}

          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-900/40 border-y border-slate-800">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">
                {t.aboutUs.valuesEyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.aboutUs.valuesTitle}
              </h2>
            </div>

            <div className="mt-12 grid gap-10 md:grid-cols-3">

              <div>
                <h3 className="text-xl font-bold text-white">
                  {t.aboutUs.communityFirstTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.communityFirstBody}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {t.aboutUs.adventureTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.adventureBody}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  {t.aboutUs.simplicityTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.simplicityBody}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA -- same muted cyan/emerald recipe as the Ocean Conservation
            banner (low-opacity gradient stops over a dark card, thin
            accent border) instead of a full bright gradient fill, which
            read as too bright against the rest of the page. */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-cyan-950/50 via-slate-900 to-emerald-950/40 border border-cyan-500/20 shadow-xl px-6 py-16 text-center sm:px-12">

            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.aboutUs.ctaTitle}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
              {t.aboutUs.ctaBody}
            </p>

            <div className="mt-8">
              {user ? (
                <Link
                  href="/"
                  className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  {t.aboutUs.ctaButtonExplore}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("signup")}
                  className="inline-flex items-center rounded-full bg-cyan-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  {t.aboutUs.ctaButton}
                </button>
              )}
            </div>

          </div>
        </section>

      </main>
    </>
  );
}
