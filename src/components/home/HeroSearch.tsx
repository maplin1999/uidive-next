"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Layers, Waves, Wind } from "lucide-react";
import { DiveTrip, isoDate, upcomingSaturday } from "@/lib/trips";
import { DatePickerCalendar } from "@/components/home/DatePickerCalendar";
import { useLocale } from "@/components/i18n/LocaleContext";

export type ActivityFilter = "all" | "scuba" | "freediving";

const ACTIVITY_ICONS: Record<ActivityFilter, React.ComponentType<{ className?: string }>> = {
  all: Layers,
  scuba: Waves,
  freediving: Wind,
};

// Migrated from the old site's HERO_ACTIVITY_OPTIONS/selectHeroActivity() --
// this filters by trip.activity_type (Scuba vs Free Diving), same as the old
// site. The Where-suggestion dropdown below it (renderHeroWhereSuggestions())
// genuinely wasn't implemented in app.js, but the Activity dropdown was fully
// wired, so it's ported for real rather than repurposed.
export function HeroSearch({
  trips,
  query,
  onQueryChange,
  activity,
  onActivityChange,
  dateFilter,
  dateLabel,
  onDateChange,
  onSearch,
}: {
  trips: DiveTrip[];
  query: string;
  onQueryChange: (q: string) => void;
  activity: ActivityFilter;
  onActivityChange: (a: ActivityFilter) => void;
  dateFilter: string | null;
  dateLabel: string;
  onDateChange: (date: string | null, label: string) => void;
  onSearch: () => void;
}) {
  const { t } = useLocale();
  const ACTIVITY_LABELS: Record<ActivityFilter, string> = {
    all: t.heroSearch.allActivities,
    scuba: t.heroSearch.scuba,
    freediving: t.heroSearch.freeDiving,
  };
  const [whereOpen, setWhereOpen] = useState(false);
  const [whenOpen, setWhenOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const destinations = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      if (t.location) set.add(t.location);
    });
    return Array.from(set).slice(0, 8);
  }, [trips]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return destinations;
    return destinations.filter((d) => d.toLowerCase().includes(q));
  }, [destinations, query]);

  // Click-away: close whichever dropdown is open when the user clicks
  // outside this whole search pill, same job the old site's document-level
  // click listeners did for its other dropdowns (profile menu, date picker).
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setWhereOpen(false);
        setWhenOpen(false);
        setActivityOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function pickDatePreset(label: string, date: Date | null) {
    onDateChange(date ? isoDate(date) : null, label);
    setWhenOpen(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="relative" ref={wrapperRef}>
        <div className="panel-sunken overflow-hidden flex flex-col sm:flex-row bg-slate-950/80 border border-slate-800 rounded-3xl sm:rounded-full shadow-lg w-full">
          <div className="flex flex-col sm:flex-row flex-1">
            {/* WHERE */}
            <div
              className="relative hover:z-10 flex-1 sm:min-w-[160px] flex flex-col justify-center px-5 py-3 sm:py-2.5 hover:bg-slate-800/50 hero-segment-shadow transition-colors cursor-text"
              onClick={(e) => {
                e.stopPropagation();
                setWhereOpen(true);
                setWhenOpen(false);
                setActivityOpen(false);
              }}
            >
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block pointer-events-none">
                {t.heroSearch.where}
              </label>
              <input
                type="text"
                autoComplete="off"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onFocus={() => {
                  setWhereOpen(true);
                  setWhenOpen(false);
                  setActivityOpen(false);
                }}
                onClick={(e) => e.stopPropagation()}
                placeholder={t.heroSearch.searchDestinationsPlaceholder}
                className="bg-transparent text-sm w-full focus:outline-none placeholder-slate-200 text-slate-200 truncate"
              />

              {/* WHERE dropdown -- nested inside the Where segment itself
                  (which is already position:relative) rather than the outer
                  search-pill wrapper, so "top-full" anchors to this field.
                  Anchoring it to the wrapper instead put it below the whole
                  pill (including the Search button) on mobile, where the
                  pill stacks Where/When/Activity/Search vertically. */}
              {whereOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute z-30 top-full mt-2 left-0 w-72 max-w-[85vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 max-h-72 overflow-y-auto"
                >
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-1 pb-2">
                    {t.heroSearch.popularDestinations}
                  </div>
                  <div className="space-y-0.5">
                    {suggestions.length === 0 && (
                      <p className="text-xs text-slate-500 px-2 py-1.5">{t.heroSearch.noMatchingDestinations}</p>
                    )}
                    {suggestions.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          onQueryChange(d);
                          setWhereOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors truncate"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* WHEN */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setWhenOpen((v) => !v);
                setWhereOpen(false);
                setActivityOpen(false);
              }}
              className="relative hover:z-10 flex-1 sm:min-w-[130px] flex flex-col justify-center text-left px-5 py-3 sm:py-2.5 hover:bg-slate-800/50 hero-segment-shadow transition-colors"
            >
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t.heroSearch.when}</div>
              <span className="text-sm text-slate-200 whitespace-nowrap block truncate">{dateLabel}</span>
            </button>

            {/* ACTIVITY */}
            <div
              className="relative hover:z-10 flex-1 sm:min-w-[160px] flex items-center hover:bg-slate-800/50 hero-segment-shadow transition-colors"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivityOpen((v) => !v);
                  setWhereOpen(false);
                  setWhenOpen(false);
                }}
                className="flex-1 flex flex-col justify-center text-left px-5 py-3 sm:py-2.5"
              >
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t.heroSearch.activity}</div>
                <span className="text-sm text-slate-200 whitespace-nowrap block truncate">
                  {ACTIVITY_LABELS[activity]}
                </span>
              </button>
              <button
                type="button"
                onClick={onSearch}
                aria-label={t.heroSearch.searchDiveTrips}
                className="hidden sm:flex shrink-0 mr-1.5 w-11 h-11 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 items-center justify-center transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-2 border-t border-slate-800 sm:hidden">
            <button
              type="button"
              onClick={onSearch}
              aria-label={t.heroSearch.searchDiveTrips}
              className="w-full h-11 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center gap-2 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-bold">{t.heroSearch.search}</span>
            </button>
          </div>
        </div>

        {/* WHEN dropdown */}
        {whenOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute z-30 top-full mt-2 left-0 sm:left-auto sm:right-1/3 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-2"
          >
            <div className="flex items-center gap-1.5 px-1">
              <button
                type="button"
                onClick={() => pickDatePreset(t.heroSearch.anyDate, null)}
                className={`flex-1 text-center px-2 py-1.5 rounded-xl text-[11px] font-bold transition-colors ${
                  dateFilter === null
                    ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-300"
                    : "border border-transparent text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t.heroSearch.anyDate}
              </button>
              <button
                type="button"
                onClick={() => pickDatePreset(t.heroSearch.thisWeekend, upcomingSaturday(0))}
                className="flex-1 text-center px-2 py-1.5 rounded-xl text-[11px] font-bold border border-transparent text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {t.heroSearch.thisWeekend}
              </button>
              <button
                type="button"
                onClick={() => pickDatePreset(t.heroSearch.nextWeekend, upcomingSaturday(1))}
                className="flex-1 text-center px-2 py-1.5 rounded-xl text-[11px] font-bold border border-transparent text-slate-300 hover:bg-slate-800 transition-colors"
              >
                {t.heroSearch.nextWeekend}
              </button>
            </div>
            <div className="border-t border-slate-800 pt-2">
              <DatePickerCalendar
                selectedDate={dateFilter}
                onSelect={(iso, label) => pickDatePreset(label, new Date(iso + "T00:00:00"))}
              />
            </div>
          </div>
        )}

        {/* ACTIVITY dropdown */}
        {activityOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute z-30 top-full mt-2 right-0 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-1.5 space-y-0.5"
          >
            {(Object.keys(ACTIVITY_LABELS) as ActivityFilter[]).map((key) => {
              const active = activity === key;
              const Icon = ACTIVITY_ICONS[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onActivityChange(key);
                    setActivityOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors ${
                    active
                      ? "bg-cyan-500/10 border border-cyan-500/40 text-cyan-300 font-bold"
                      : "border border-transparent hover:bg-slate-800 text-slate-200 font-semibold"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-cyan-400" : "text-slate-400"}`} />
                  <span>{ACTIVITY_LABELS[key]}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
