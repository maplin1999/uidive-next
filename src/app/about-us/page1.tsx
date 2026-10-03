import Link from "next/link";
import { ArrowLeft, Waves, Compass, Users, ShieldCheck } from "lucide-react";

// New page -- the old vanilla site had no About page to migrate, this is
// straight new content. Kept as a plain server component (static copy, no
// interactivity) and styled to match /legal's card layout so the two public
// "about the site" pages feel like one family.
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Waves className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">About UiDive</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              UiDive is a scuba &amp; freediving booking platform built around one idea: finding
              your next dive shouldn&apos;t mean digging through a dozen dive shop websites and
              group chats. We bring real trips, real hosts, and a real community of divers
              together in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <AboutPoint
              icon={<Compass className="w-5 h-5 text-cyan-400" />}
              title="Find a trip"
              body="Search dives by location, date, and activity -- scuba or freediving -- with live conditions on every listing."
            />
            <AboutPoint
              icon={<Users className="w-5 h-5 text-emerald-400" />}
              title="Dive with people"
              body="Log your dives, follow buddies, and share your trips with a community that actually gets in the water."
            />
            <AboutPoint
              icon={<ShieldCheck className="w-5 h-5 text-violet-400" />}
              title="Book with confidence"
              body="Verified hosts, clear pricing, and secure payment on every booking -- no surprises on the boat."
            />
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base font-bold text-white">Our story</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We&apos;re a small team of divers who got tired of booking trips over DMs and
              spreadsheets. UiDive started as a way to keep track of our own dive logs and
              buddies, and grew into a platform for hosts and dive shops to list trips and for
              divers everywhere to find them.
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              We&apos;re still early, and still building -- if there&apos;s something you wish
              UiDive did, we&apos;d genuinely like to hear about it.{" "}
              <a href="mailto:support@uidive.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Get in touch
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function AboutPoint({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
      {icon}
      <h3 className="text-sm font-bold text-white">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{body}</p>
    </div>
  );
}
