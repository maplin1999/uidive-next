"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isoDate } from "@/lib/trips";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// Replaces the old plain native <input type="date"> with a real styled
// month-view grid -- previous/next month navigation, today's date ringed,
// the selected day filled solid, and past days dimmed/disabled since dive
// trips are always forward-looking (same assumption the "This Weekend"/
// "Next Weekend" presets above this already make). Clicking a leading/
// trailing day from an adjacent month both selects that date and jumps the
// grid to its month, which is the behavior people expect from a calendar
// picker.
export function DatePickerCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string | null;
  onSelect: (isoDateStr: string, label: string) => void;
}) {
  const today = startOfDay(new Date());
  const initialMonth = selectedDate ? new Date(selectedDate + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  type Cell = { date: Date; inCurrentMonth: boolean };
  const cells: Cell[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    cells.push({ date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i), inCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(viewYear, viewMonth, d), inCurrentMonth: true });
  }
  let trailing = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(viewYear, viewMonth + 1, trailing++), inCurrentMonth: false });
  }

  function goToMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function handlePick(date: Date) {
    if (startOfDay(date) < today) return;
    const iso = isoDate(date);
    const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    setViewYear(date.getFullYear());
    setViewMonth(date.getMonth());
    onSelect(iso, label);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => goToMonth(-1)}
          aria-label="Previous month"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-white">{monthLabel}</span>
        <button
          type="button"
          onClick={() => goToMonth(1)}
          aria-label="Next month"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 px-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i} className="text-center text-[9px] font-bold text-slate-500 uppercase py-1">
            {w}
          </div>
        ))}
        {cells.map(({ date, inCurrentMonth }, i) => {
          const iso = isoDate(date);
          const isPast = startOfDay(date) < today;
          const isToday = iso === isoDate(today);
          const isSelected = selectedDate === iso;
          return (
            <button
              key={i}
              type="button"
              disabled={isPast}
              onClick={() => handlePick(date)}
              className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : isPast
                    ? "text-slate-700 cursor-not-allowed"
                    : inCurrentMonth
                      ? "text-slate-200 hover:bg-slate-800"
                      : "text-slate-600 hover:bg-slate-800/60"
              } ${isToday && !isSelected ? "ring-1 ring-cyan-500/60" : ""}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
