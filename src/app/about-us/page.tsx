import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Discover UiDive, a platform built to help divers find dives, buddies, discover experiences, and connect with the diving community.",
  keywords: [
    "scuba diving",
    "dive buddies",
    "scuba diving community",
    "diving experiences",
    "find a dive buddy",
    "diving platform",
  ],
  openGraph: {
    title: "About Us",
    description:
      "A better way for divers to connect, discover and dive together.",
    type: "website",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UiDive",
  url: "https://www.uidive.com",
  logo: "https://www.uidive.com/logo.png",
  description:
    "UiDive is a platform helping divers find dives, connect with dive buddies, discover diving experiences and explore the underwater world together.",
  sameAs: [
    "https://www.instagram.com/uidive",
    "https://www.facebook.com/uidive",
  ],
};

export default function AboutPage() {
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
                About UiDive
              </p>

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Connecting people who love to dive.
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                UiDive is a scuba &amp; freediving booking platform 
                built around one idea: finding your next dive
                We bring real trips, real hosts, and a real community of divers
                together in one place.
              </p>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                Our Story
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Diving is better together.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                Scuba diving has always been about exploration, adventure and
                connection. But finding the right person to dive with isn't
                always easy.
              </p>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                DiveBuddy was created to bring the diving community together
                in one place. Whether you're looking for a buddy for your
                next shore dive, discovering a new dive destination or
                looking for people who share your passion, we're building the
                tools to make that connection easier.
              </p>
            </div>

            <div className="rounded-3xl bg-slate-100 p-8 sm:p-12">
              <div className="text-6xl">🤿</div>

              <blockquote className="mt-8 text-2xl font-semibold leading-9 text-slate-900">
                "Find your people. Find your dive. Explore more."
              </blockquote>
            </div>

          </div>
        </section>

        {/* Mission */}
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
                Our Mission
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Make diving more accessible, social and connected.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-600">
                We want to make it easier for divers around the world to
                discover opportunities, meet fellow divers and spend more
                time doing what they love.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">

              <article className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                  🤝
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  Connect
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Meet divers with similar interests, experience levels and
                  plans.
                </p>
              </article>

              <article className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                  🌊
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  Discover
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Discover dive sites, trips, experiences and new places to
                  explore beneath the surface.
                </p>
              </article>

              <article className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100 text-2xl">
                  🐠
                </div>

                <h3 className="mt-6 text-xl font-bold">
                  Explore
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  Turn your next dive into an opportunity to explore
                  somewhere new with people who share your passion.
                </p>
              </article>

            </div>
          </div>
        </section>

        {/* What We Do */}
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600">
              What We Do
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              One place for your diving life.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              We're building a platform designed around the way modern
              divers actually plan and experience their dives.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                title: "Find Dive Buddies",
                text: "Connect with divers looking for their next underwater adventure.",
              },
              {
                title: "Discover Dives",
                text: "Find interesting dive locations and experiences.",
              },
              {
                title: "Plan Adventures",
                text: "Organise upcoming dives and connect with people going the same way.",
              },
              {
                title: "Build Community",
                text: "Create meaningful connections with divers around the world.",
              },
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
                Our Values
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Built around the diving community.
              </h2>
            </div>

            <div className="mt-12 grid gap-10 md:grid-cols-3">

              <div>
                <h3 className="text-xl font-bold">
                  Community First
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Great diving experiences often start with great people.
                  Community is at the heart of everything we build.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Adventure
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  We believe there is always another reef, wreck, coastline
                  or underwater world waiting to be explored.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Simplicity
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  Finding a dive, meeting a buddy and planning an adventure
                  should be simple.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-cyan-500">
          <div className="mx-auto max-w-7xl px-6 py-20 text-center lg:px-8">

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Ready to find your next dive?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-900/80">
              Join a growing community of people who want to spend more time
              exploring beneath the surface.
            </p>

            <div className="mt-8">
              <a
                href="/signup"
                className="inline-flex items-center rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Join DiveBuddy
              </a>
            </div>

          </div>
        </section>

      </main>
    </>
  );
}