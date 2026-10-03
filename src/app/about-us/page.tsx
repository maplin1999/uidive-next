"use client";

import { Waves, Compass, Users, ShieldCheck } from "lucide-react";
import { useLocale } from "@/components/i18n/LocaleContext";

// New page -- the old vanilla site had no About page to migrate, this is
// straight new content. Styled to match /legal's card layout so the two public
// "about the site" pages feel like one family.
export default function AboutPage() {
  const { t } = useLocale();

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 sm:py-12">
      <div className="max-w-3xl mx-auto space-y-6">

        <div className="p-6 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Waves className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{t.aboutUs.heading}</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.aboutUs.intro}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <AboutPoint
              icon={<Compass className="w-5 h-5 text-cyan-400" />}
              title={t.aboutUs.findTripTitle}
              body={t.aboutUs.findTripBody}
            />
            <AboutPoint
              icon={<Users className="w-5 h-5 text-emerald-400" />}
              title={t.aboutUs.diveWithPeopleTitle}
              body={t.aboutUs.diveWithPeopleBody}
            />
            <AboutPoint
              icon={<ShieldCheck className="w-5 h-5 text-violet-400" />}
              title={t.aboutUs.bookConfidenceTitle}
              body={t.aboutUs.bookConfidenceBody}
            />
          </div>

          <div className="space-y-3 border-t border-slate-800 pt-6">
            <h2 className="text-base font-bold text-white">{t.aboutUs.storyHeading}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.aboutUs.storyBody1}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t.aboutUs.storyBody2Prefix}{" "}
              <a href="mailto:support@uidive.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                {t.aboutUs.getInTouch}
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
