"use client";

import { useRef, useState } from "react";
import { Anchor, Calendar, X } from "lucide-react";
import { DiveLog, DiveLogInput, createDiveLog, updateDiveLog } from "@/lib/dive-log";
import { EQUIPMENT_ITEMS, isoDate } from "@/lib/trips";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useClickOutside } from "@/lib/useClickOutside";
import { DatePickerCalendar } from "@/components/home/DatePickerCalendar";
import { useLocale } from "@/components/i18n/LocaleContext";

// Log a Dive -- create or edit a single public.dive_logs row. Follows the
// same themed-field conventions as TripFormModal (ThemedSelect's native-popup
// problem doesn't apply here since there's no dropdown, but the date picker
// is the same DatePickerCalendar popover for the same reason: a native
// input[type=date] draws an unthemed OS calendar). Opened three ways:
//  - "+ Log a Dive" from the logbook (blank, booking_id null)
//  - "Add to Dive Log" on a completed booking (pre-filled from the trip,
//    booking_id set, but still fully editable before saving -- the diver
//    asked for the freedom to tweak or add details before it's logged)
//  - "Edit" from a dive's detail view (existing values, update instead of
//    insert)
export function DiveLogFormModal({
  userId,
  diveLog,
  prefill,
  onClose,
  onSaved,
}: {
  userId: string;
  diveLog?: DiveLog | null;
  prefill?: { dive_date: string; location: string; dive_site?: string; booking_id?: string | null } | null;
  onClose: () => void;
  onSaved: (log: DiveLog) => void;
}) {
  const { t } = useLocale();
  const isEdit = !!diveLog;
  const [diveDate, setDiveDate] = useState<string | null>(diveLog?.dive_date ?? prefill?.dive_date ?? null);
  const [location, setLocation] = useState(diveLog?.location ?? prefill?.location ?? "");
  const [diveSite, setDiveSite] = useState(diveLog?.dive_site ?? prefill?.dive_site ?? "");
  const [depth, setDepth] = useState(diveLog?.depth_m != null ? String(diveLog.depth_m) : "");
  const [duration, setDuration] = useState(diveLog?.duration_min != null ? String(diveLog.duration_min) : "");
  const [buddyName, setBuddyName] = useState(diveLog?.buddy_name ?? "");
  const [notes, setNotes] = useState(diveLog?.notes ?? "");
  const [equipment, setEquipment] = useState<Record<string, boolean>>(
    Object.fromEntries((diveLog?.equipment ?? []).map((id) => [id, true]))
  );
  const [error, setError] = useState("");
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  useClickOutside(dateRef, () => setDateOpen(false));

  useEscapeClose(onClose);

  async function handleSave() {
    if (!diveDate || !location.trim()) {
      const bad = new Set<string>();
      if (!diveDate) bad.add("diveDate");
      if (!location.trim()) bad.add("location");
      setInvalidFields(bad);
      setError(t.diveLogFormModal.dateAndLocationRequired);
      return;
    }
    setError("");
    setSaving(true);
    try {
      const input: DiveLogInput = {
        dive_date: diveDate,
        location: location.trim(),
        dive_site: diveSite.trim(),
        depth_m: depth.trim() ? Number(depth) : null,
        duration_min: duration.trim() ? Number(duration) : null,
        buddy_name: buddyName.trim(),
        notes: notes.trim(),
        equipment: Object.keys(equipment).filter((id) => equipment[id]),
        booking_id: diveLog?.booking_id ?? prefill?.booking_id ?? null,
      };
      const saved = isEdit && diveLog ? await updateDiveLog(diveLog.id, input) : await createDiveLog(userId, input);
      onSaved(saved);
    } catch (err) {
      console.error("Could not save dive log entry:", err);
      setError(t.diveLogFormModal.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-400" /> {isEdit ? t.diveLogFormModal.editDive : t.diveLogFormModal.logADive}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {prefill?.booking_id ? t.diveLogFormModal.prefilledNote : t.diveLogFormModal.privateNote}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.common.close}
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.diveLogFormModal.date}>
            <div className="relative" ref={dateRef}>
              <button
                type="button"
                onClick={() => setDateOpen((v) => !v)}
                className={`${fieldCls(invalidFields.has("diveDate"))} flex items-center justify-between gap-2 text-left`}
              >
                <span className={diveDate ? "text-slate-200" : "text-slate-500"}>
                  {diveDate
                    ? new Date(diveDate + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : t.diveLogFormModal.selectDate}
                </span>
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
              {dateOpen && (
                <div className="absolute z-30 top-full mt-1.5 left-0 w-72 max-w-[85vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2">
                  <DatePickerCalendar
                    selectedDate={diveDate}
                    maxDate={isoDate(new Date())}
                    onSelect={(iso) => {
                      setDiveDate(iso);
                      setDateOpen(false);
                      setInvalidFields((prev) => {
                        if (!prev.has("diveDate")) return prev;
                        const next = new Set(prev);
                        next.delete("diveDate");
                        return next;
                      });
                    }}
                  />
                </div>
              )}
            </div>
          </Field>
          <Field label={t.diveLogFormModal.location}>
            <input
              type="text"
              autoComplete="off"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setInvalidFields((prev) => {
                  if (!prev.has("location")) return prev;
                  const next = new Set(prev);
                  next.delete("location");
                  return next;
                });
              }}
              maxLength={80}
              placeholder={t.diveLogFormModal.locationPlaceholder}
              className={fieldCls(invalidFields.has("location"))}
            />
          </Field>
        </div>

        <Field label={t.diveLogFormModal.diveSiteOptional}>
          <input
            type="text"
            autoComplete="off"
            value={diveSite}
            onChange={(e) => setDiveSite(e.target.value)}
            maxLength={80}
            placeholder={t.diveLogFormModal.diveSitePlaceholder}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.diveLogFormModal.maxDepth}>
            <input
              type="number"
              min={0}
              step="0.1"
              autoComplete="off"
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
              placeholder="18"
              className={`${inputCls} no-spinner`}
            />
          </Field>
          <Field label={t.diveLogFormModal.duration}>
            <input
              type="number"
              min={0}
              autoComplete="off"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="45"
              className={`${inputCls} no-spinner`}
            />
          </Field>
        </div>

        <Field label={t.diveLogFormModal.buddyOptional}>
          <input
            type="text"
            autoComplete="off"
            value={buddyName}
            onChange={(e) => setBuddyName(e.target.value)}
            maxLength={60}
            placeholder={t.diveLogFormModal.buddyPlaceholder}
            className={inputCls}
          />
        </Field>

        <Field label={t.diveLogFormModal.notesOptional}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={600}
            placeholder={t.diveLogFormModal.notesPlaceholder}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <details className="text-xs" open={Object.values(equipment).some(Boolean)}>
          <summary className="cursor-pointer text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            {t.diveLogFormModal.equipmentUsedOptional}
          </summary>
          <div className="space-y-2 mt-3">
            {EQUIPMENT_ITEMS.map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-cyan-500/40 transition-colors"
              >
                <span className="text-sm text-slate-200 font-semibold">
                  {t.equipment.items[item.id as keyof typeof t.equipment.items] ?? item.label}
                </span>
                <input
                  type="checkbox"
                  checked={!!equipment[item.id]}
                  onChange={(e) => setEquipment((prev) => ({ ...prev, [item.id]: e.target.checked }))}
                  className="w-5 h-5 accent-cyan-500 rounded shrink-0"
                />
              </label>
            ))}
          </div>
        </details>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          {saving ? t.diveLogFormModal.saving : isEdit ? t.diveLogFormModal.saveChanges : t.diveLogFormModal.logThisDive}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500";

function fieldCls(invalid: boolean) {
  return invalid ? `${inputCls} !border-rose-500` : inputCls;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{label}</label>
      {children}
    </div>
  );
}
