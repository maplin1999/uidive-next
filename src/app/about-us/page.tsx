"use client";

import { useLocale } from "@/components/i18n/LocaleContext";

// Marketing-style About page. Metadata/SEO strings (title, description,
// keywords, schema.org JSON-LD) stay in English -- they're consumed by
// search engines and social previews rather than rendered for a logged-in
// visitor's chosen locale, and generateMetadata would need its own
// server-side locale detection to vary them, which this app doesn't do.
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

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <main className="bg-white text-slate-900">

        {/* Hero */}
        <section className="relative overflow-hidden bg-slate-950 text-white">
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
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                {t.aboutUs.storyEyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.aboutUs.storyTitle}
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                {t.aboutUs.storyBody1}
              </p>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                {t.aboutUs.storyBody2}
              </p>
            </div>

            <div className="rounded-3xl bg-slate-100 p-8 sm:p-12">
              <div className="text-6xl">🤿</div>

              <blockquote className="mt-8 text-2xl font-semibold leading-9 text-slate-900">
                &quot;{t.aboutUs.storyQuote}&quot;
              </blockquote>
            </div>

          </div>
        </section>

        {/* Mission */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                {t.aboutUs.missionEyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                {t.aboutUs.missionTitle}
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                {t.aboutUs.missionBody}
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">

              <article className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                  🤝
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {t.aboutUs.connectTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {t.aboutUs.connectBody}
                </p>
              </article>

              <article className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                  🌊
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {t.aboutUs.discoverTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {t.aboutUs.discoverBody}
                </p>
              </article>

              <article className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                  🐠
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  {t.aboutUs.exploreTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {t.aboutUs.exploreBody}
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              {t.aboutUs.whatWeDoEyebrow}
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.aboutUs.whatWeDoTitle}
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              {t.aboutUs.whatWeDoBody}
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[
              { title: t.aboutUs.findBuddiesTitle, text: t.aboutUs.findBuddiesBody },
              { title: t.aboutUs.discoverDivesTitle, text: t.aboutUs.discoverDivesBody },
              { title: t.aboutUs.planAdventuresTitle, text: t.aboutUs.planAdventuresBody },
              { title: t.aboutUs.buildCommunityTitle, text: t.aboutUs.buildCommunityBody },
            ].map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}

          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-950 text-white">
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
                <h3 className="text-xl font-bold">
                  {t.aboutUs.communityFirstTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.communityFirstBody}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  {t.aboutUs.adventureTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.adventureBody}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  {t.aboutUs.simplicityTitle}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {t.aboutUs.simplicityBody}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-cyan-500">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {t.aboutUs.ctaTitle}
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-900/80">
              {t.aboutUs.ctaBody}
            </p>

            <div className="mt-8">
              <a
                href="/signup"
                className="inline-flex items-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {t.aboutUs.ctaButton}
              </a>
            </div>

          </div>
        </section>

      </main>
    </>
  );
}
