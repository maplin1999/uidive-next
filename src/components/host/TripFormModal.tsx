"use client";

import { useRef, useState } from "react";
import { Anchor, Calendar, X } from "lucide-react";
import { HostTrip, TripFormFields, createTrip, updateTrip } from "@/lib/host";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useClickOutside } from "@/lib/useClickOutside";
import { ThemedSelect } from "@/components/ui/ThemedSelect";
import { ThemedTimeSelect } from "@/components/ui/ThemedTimeSelect";
import { DatePickerCalendar } from "@/components/home/DatePickerCalendar";
import { useLocale } from "@/components/i18n/LocaleContext";
import type { Dictionary } from "@/lib/i18n/translations/en";

// Values (not just labels) are real stored enums/strings in dive_trips, so
// only the label side is looked up from the dictionary at render time --
// these arrays stay module-level and can't call useLocale() themselves.
const TRIP_TYPE_OPTIONS: { value: string; labelKey: keyof Dictionary["tripFormModal"] }[] = [
  { value: "boat", labelKey: "tripTypeBoat" },
  { value: "shore", labelKey: "tripTypeShore" },
];
const ACTIVITY_TYPE_OPTIONS: { value: string; labelKey: keyof Dictionary["tripCard"] }[] = [
  { value: "scuba", labelKey: "scuba" },
  { value: "freediving", labelKey: "freeDiving" },
];
const DIFFICULTY_OPTIONS: { value: string; labelKey: keyof Dictionary["tripFormModal"] }[] = [
  { value: "Easy", labelKey: "difficultyEasy" },
  { value: "Moderate", labelKey: "difficultyModerate" },
  { value: "Advanced", labelKey: "difficultyAdvanced" },
];

function tripToFields(trip?: HostTrip | null): TripFormFields {
  if (!trip) {
    return {
      title: "",
      description: "",
      location: "",
      tripType: "boat",
      activityType: "scuba",
      difficulty: "Easy",
      maxDepth: "",
      visibility: "",
      waterTemp: "",
      swell: "",
      wind: "",
      tide: "",
      current: "",
      price: 0,
      capacity: 8,
      scheduledDate: null,
      scheduledTime: "",
      imageUrl: "",
      highlight: "",
      conditionsLabel: "",
    };
  }
  return {
    title: trip.title,
    description: trip.description || "",
    location: trip.location,
    tripType: trip.trip_type,
    activityType: trip.activity_type || "scuba",
    difficulty: trip.difficulty,
    maxDepth: trip.max_depth,
    visibility: trip.visibility,
    waterTemp: trip.water_temp,
    swell: trip.swell,
    wind: trip.wind,
    tide: trip.tide,
    current: trip.current,
    price: trip.price,
    capacity: trip.capacity,
    scheduledDate: trip.scheduled_date,
    scheduledTime: trip.scheduled_time,
    imageUrl: trip.image_url,
    highlight: trip.highlight,
    conditionsLabel: trip.conditions_label,
  };
}

// Migrated from the old site's #host-trip-form-modal (submitHostTripForm()).
// The old site's custom calendar/time-picker widgets and max-depth live
// formatter are replaced with a themed calendar popover (DatePickerCalendar,
// shared with HeroSearch's "When" filter) for the date, a themed
// ThemedTimeSelect for the time, and a plain text field for max depth.
// Trip Type/Activity/Difficulty use ThemedSelect instead of native <select>.
// All of these swaps exist for the same reason: a native select/date/time
// input's open dropdown/picker panel is OS-drawn and can't be themed, so on
// Windows it renders as an unstyled light popup no matter what color-scheme
// is set on the closed control. Lat/lng geocoding is dropped entirely --
// both create_trip/update_trip default those params to null.
export function TripFormModal({
  trip,
  onClose,
  onSaved,
}: {
  trip?: HostTrip | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLocale();
  const tripTypeOptions = TRIP_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t.tripFormModal[o.labelKey] }));
  const activityTypeOptions = ACTIVITY_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t.tripCard[o.labelKey] }));
  const difficultyOptions = DIFFICULTY_OPTIONS.map((o) => ({ value: o.value, label: t.tripFormModal[o.labelKey] }));
  const [fields, setFields] = useState<TripFormFields>(tripToFields(trip));
  const [error, setError] = useState("");
  // Ported from the old site's field-invalid class / validateRequiredFields():
  // required fields left empty get a red border, not just the text error
  // banner above, and clear it again the moment they're edited.
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  useClickOutside(dateRef, () => setDateOpen(false));

  useEscapeClose(onClose);
  const isEdit = !!trip;

  function update<K extends keyof TripFormFields>(key: K, value: TripFormFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    setInvalidFields((prev) => {
      if (!prev.has(key as string)) return prev;
      const next = new Set(prev);
      next.delete(key as string);
      return next;
    });
  }

  async function handleSave() {
    if (!fields.title.trim() || !fields.location.trim()) {
      const bad = new Set<string>();
      if (!fields.title.trim()) bad.add("title");
      if (!fields.location.trim()) bad.add("location");
      setInvalidFields(bad);
      setError(t.tripFormModal.titleLocationRequired);
      return;
    }
    setError("");
    setSaving(true);
    try {
      if (isEdit && trip) {
        await updateTrip(trip.id, fields);
      } else {
        await createTrip(fields);
      }
      onSaved();
    } catch (err) {
      console.error("Could not save trip:", err);
      setError(t.tripFormModal.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-400" /> {isEdit ? t.tripFormModal.editTrip : t.tripFormModal.createTrip}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{t.tripFormModal.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.tripFormModal.close}
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

        <Field label={t.tripFormModal.tripTitleLabel}>
          <input
            type="text"
            autoComplete="off"
            value={fields.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={80}
            placeholder={t.tripFormModal.tripTitlePlaceholder}
            className={fieldCls(invalidFields.has("title"))}
          />
        </Field>

        <Field label={t.tripFormModal.descriptionLabel}>
          <textarea
            value={fields.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            maxLength={600}
            placeholder={t.tripFormModal.descriptionPlaceholder}
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.tripFormModal.locationLabel}>
            <input
              type="text"
              autoComplete="off"
              value={fields.location}
              onChange={(e) => update("location", e.target.value)}
              maxLength={80}
              placeholder={t.tripFormModal.locationPlaceholder}
              className={fieldCls(invalidFields.has("location"))}
            />
          </Field>
          <Field label={t.tripFormModal.tripTypeLabel}>
            <ThemedSelect
              value={fields.tripType}
              options={tripTypeOptions}
              onChange={(v) => update("tripType", v)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.tripFormModal.activityLabel}>
            <ThemedSelect
              value={fields.activityType}
              options={activityTypeOptions}
              onChange={(v) => update("activityType", v)}
            />
          </Field>
          <Field label={t.tripFormModal.difficultyLabel}>
            <ThemedSelect
              value={fields.difficulty}
              options={difficultyOptions}
              onChange={(v) => update("difficulty", v)}
            />
          </Field>
        </div>

        <Field label={t.tripFormModal.maxDepthLabel}>
          <input
            type="text"
            autoComplete="off"
            value={fields.maxDepth}
            onChange={(e) => update("maxDepth", e.target.value)}
            placeholder={t.tripFormModal.maxDepthPlaceholder}
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.tripFormModal.dateLabel}>
            <div className="relative" ref={dateRef}>
              <button
                type="button"
                onClick={() => setDateOpen((v) => !v)}
                className={`${inputCls} flex items-center justify-between gap-2 text-left`}
              >
                <span className={fields.scheduledDate ? "text-slate-200" : "text-slate-500"}>
                  {fields.scheduledDate
                    ? new Date(fields.scheduledDate + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : t.tripFormModal.selectDate}
                </span>
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
              {dateOpen && (
                <div className="absolute z-30 top-full mt-1.5 left-0 w-72 max-w-[85vw] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2">
                  <DatePickerCalendar
                    selectedDate={fields.scheduledDate}
                    onSelect={(iso) => {
                      update("scheduledDate", iso);
                      setDateOpen(false);
                    }}
                  />
                </div>
              )}
            </div>
          </Field>
          <Field label={t.tripFormModal.timeLabel}>
            <ThemedTimeSelect value={fields.scheduledTime} onChange={(v) => update("scheduledTime", v)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label={t.tripFormModal.priceLabel}>
            <input
              type="number"
              min={0}
              autoComplete="off"
              value={fields.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className={`${inputCls} no-spinner`}
            />
          </Field>
          <Field label={t.tripFormModal.capacityLabel}>
            <input
              type="number"
              min={1}
              autoComplete="off"
              value={fields.capacity}
              onChange={(e) => update("capacity", Number(e.target.value))}
              className={`${inputCls} no-spinner`}
            />
          </Field>
        </div>

        <details className="text-xs">
          <summary className="cursor-pointer text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            {t.tripFormModal.diveConditionsSummary}
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="text"
              autoComplete="off"
              value={fields.visibility}
              onChange={(e) => update("visibility", e.target.value)}
              maxLength={20}
              placeholder={t.tripFormModal.visibilityPlaceholder}
              aria-label={t.tripCard.visibility}
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.waterTemp}
              onChange={(e) => update("waterTemp", e.target.value)}
              maxLength={20}
              placeholder={t.tripFormModal.waterTempPlaceholder}
              aria-label={t.diveDetail.waterTemp}
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.swell}
              onChange={(e) => update("swell", e.target.value)}
              maxLength={20}
              placeholder={t.tripFormModal.swellPlaceholder}
              aria-label={t.diveDetail.swell}
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.wind}
              onChange={(e) => update("wind", e.target.value)}
              maxLength={20}
              placeholder={t.tripFormModal.windPlaceholder}
              aria-label={t.diveDetail.wind}
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.tide}
              onChange={(e) => update("tide", e.target.value)}
              maxLength={20}
              placeholder={t.tripFormModal.tidePlaceholder}
              aria-label={t.diveDetail.tide}
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.current}
              onChange={(e) => update("current", e.target.value)}
              maxLength={20}
              placeholder={t.tripFormModal.currentPlaceholder}
              aria-label={t.diveDetail.current}
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.conditionsLabel}
              onChange={(e) => update("conditionsLabel", e.target.value)}
              maxLength={60}
              placeholder={t.tripFormModal.conditionsSummaryPlaceholder}
              aria-label={t.tripFormModal.conditionsSummaryAria}
              className={`${inputCls} col-span-2`}
            />
          </div>
        </details>

        <details className="text-xs">
          <summary className="cursor-pointer text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            {t.tripFormModal.mediaHighlightSummary}
          </summary>
          <div className="space-y-2 mt-3">
            <input
              type="url"
              autoComplete="off"
              value={fields.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder={t.tripFormModal.imageUrlPlaceholder}
              aria-label={t.tripFormModal.imageUrlPlaceholder}
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.highlight}
              onChange={(e) => update("highlight", e.target.value)}
              placeholder={t.tripFormModal.highlightPlaceholder}
              aria-label={t.tripFormModal.highlightAria}
              className={inputCls}
            />
          </div>
        </details>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          {saving ? t.tripFormModal.saving : isEdit ? t.postForm.saveChanges : t.tripFormModal.createTrip}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500";

// field-invalid equivalent: swaps the border to rose-500 (!important in the
// old site's CSS since it's fighting the same specificity as inputCls's own
// border-slate-800) when this field failed the last required-field check.
function fieldCls(invalid: boolean) {
  return invalid ? `${inputCls} !border-rose-500` : inputCls;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
        {label}
      </label>
      {children}
    </div>
  );
}
