"use client";

import { useRef, useState } from "react";
import { Anchor, Calendar, X } from "lucide-react";
import { HostTrip, TripFormFields, createTrip, updateTrip } from "@/lib/host";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { useClickOutside } from "@/lib/useClickOutside";
import { ThemedSelect } from "@/components/ui/ThemedSelect";
import { DatePickerCalendar } from "@/components/home/DatePickerCalendar";

const TRIP_TYPE_OPTIONS = [
  { value: "boat", label: "Boat" },
  { value: "shore", label: "Shore" },
];
const ACTIVITY_TYPE_OPTIONS = [
  { value: "scuba", label: "Scuba" },
  { value: "freediving", label: "Free Diving" },
];
const DIFFICULTY_OPTIONS = [
  { value: "Easy", label: "Easy" },
  { value: "Moderate", label: "Moderate" },
  { value: "Advanced", label: "Advanced" },
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
// shared with HeroSearch's "When" filter) for the date, a native
// <input type="time"> for the time, and a plain text field for max depth.
// Trip Type/Activity/Difficulty use ThemedSelect instead of native <select>
// for the same reason: a native select's open dropdown panel is OS-drawn
// and can't be themed, so on Windows it renders as an unstyled light popup
// no matter what color-scheme is set on the closed control. Lat/lng
// geocoding is dropped entirely -- both create_trip/update_trip default
// those params to null.
export function TripFormModal({
  trip,
  onClose,
  onSaved,
}: {
  trip?: HostTrip | null;
  onClose: () => void;
  onSaved: () => void;
}) {
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
      setError("Title and location are required.");
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
      setError("Could not save this trip -- please try again.");
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
              <Anchor className="w-4 h-4 text-cyan-400" /> {isEdit ? "Edit Trip" : "Create Trip"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Divers will see this on the Explore page once saved
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
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

        <Field label="Trip Title">
          <input
            type="text"
            autoComplete="off"
            value={fields.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={80}
            placeholder="e.g. Sunrise Reef Charter"
            className={fieldCls(invalidFields.has("title"))}
          />
        </Field>

        <Field label="Description">
          <textarea
            value={fields.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            maxLength={600}
            placeholder="What divers can expect on this trip -- marine life, route, what's included..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Location">
            <input
              type="text"
              autoComplete="off"
              value={fields.location}
              onChange={(e) => update("location", e.target.value)}
              maxLength={80}
              placeholder="Cebu, PH"
              className={fieldCls(invalidFields.has("location"))}
            />
          </Field>
          <Field label="Trip Type">
            <ThemedSelect
              value={fields.tripType}
              options={TRIP_TYPE_OPTIONS}
              onChange={(v) => update("tripType", v)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Activity">
            <ThemedSelect
              value={fields.activityType}
              options={ACTIVITY_TYPE_OPTIONS}
              onChange={(v) => update("activityType", v)}
            />
          </Field>
          <Field label="Difficulty">
            <ThemedSelect
              value={fields.difficulty}
              options={DIFFICULTY_OPTIONS}
              onChange={(v) => update("difficulty", v)}
            />
          </Field>
        </div>

        <Field label="Max Depth">
          <input
            type="text"
            autoComplete="off"
            value={fields.maxDepth}
            onChange={(e) => update("maxDepth", e.target.value)}
            placeholder="18m"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
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
                    : "Select date"}
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
          <Field label="Time">
            <input
              type="time"
              value={fields.scheduledTime}
              onChange={(e) => update("scheduledTime", e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Price (per diver)">
            <input
              type="number"
              min={0}
              autoComplete="off"
              value={fields.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className={`${inputCls} no-spinner`}
            />
          </Field>
          <Field label="Capacity">
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
            Dive Conditions (optional)
          </summary>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <input
              type="text"
              autoComplete="off"
              value={fields.visibility}
              onChange={(e) => update("visibility", e.target.value)}
              maxLength={20}
              placeholder="Visibility (e.g. 15m)"
              aria-label="Visibility"
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.waterTemp}
              onChange={(e) => update("waterTemp", e.target.value)}
              maxLength={20}
              placeholder="Water Temp (e.g. 27°C)"
              aria-label="Water Temp"
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.swell}
              onChange={(e) => update("swell", e.target.value)}
              maxLength={20}
              placeholder="Swell (e.g. 0.5m)"
              aria-label="Swell"
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.wind}
              onChange={(e) => update("wind", e.target.value)}
              maxLength={20}
              placeholder="Wind (e.g. 10kt SE)"
              aria-label="Wind"
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.tide}
              onChange={(e) => update("tide", e.target.value)}
              maxLength={20}
              placeholder="Tide (e.g. Low, 8:45am)"
              aria-label="Tide"
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.current}
              onChange={(e) => update("current", e.target.value)}
              maxLength={20}
              placeholder="Current (e.g. Mild)"
              aria-label="Current"
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.conditionsLabel}
              onChange={(e) => update("conditionsLabel", e.target.value)}
              maxLength={60}
              placeholder="Conditions summary (e.g. Good Conditions)"
              aria-label="Conditions summary"
              className={`${inputCls} col-span-2`}
            />
          </div>
        </details>

        <details className="text-xs">
          <summary className="cursor-pointer text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            Media &amp; Highlight (optional)
          </summary>
          <div className="space-y-2 mt-3">
            <input
              type="url"
              autoComplete="off"
              value={fields.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="Image URL"
              aria-label="Image URL"
              className={inputCls}
            />
            <input
              type="text"
              autoComplete="off"
              value={fields.highlight}
              onChange={(e) => update("highlight", e.target.value)}
              placeholder="Highlight tag (e.g. Giant Cuttlefish)"
              aria-label="Highlight tag"
              className={inputCls}
            />
          </div>
        </details>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Trip"}
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
