"use client";

import { useState } from "react";
import { Anchor, X } from "lucide-react";
import { HostTrip, TripFormFields, createTrip, updateTrip } from "@/lib/host";

const TRIP_TYPES = ["shore", "boat"];
const ACTIVITY_TYPES = ["scuba", "freediving"];
const DIFFICULTIES = ["Easy", "Moderate", "Advanced"];

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
// formatter are replaced with native <input type="date">/<input type="time">
// and a plain text field, and lat/lng geocoding is dropped entirely -- both
// create_trip/update_trip default those params to null.
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
  const [saving, setSaving] = useState(false);
  const isEdit = !!trip;

  function update<K extends keyof TripFormFields>(key: K, value: TripFormFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!fields.title.trim() || !fields.location.trim()) {
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
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
            value={fields.title}
            onChange={(e) => update("title", e.target.value)}
            maxLength={80}
            placeholder="e.g. Sunrise Reef Charter"
            className={inputCls}
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
              value={fields.location}
              onChange={(e) => update("location", e.target.value)}
              maxLength={80}
              placeholder="Cebu, PH"
              className={inputCls}
            />
          </Field>
          <Field label="Trip Type">
            <select
              value={fields.tripType}
              onChange={(e) => update("tripType", e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            >
              {TRIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "boat" ? "Boat" : "Shore"}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Activity">
            <select
              value={fields.activityType}
              onChange={(e) => update("activityType", e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            >
              {ACTIVITY_TYPES.map((a) => (
                <option key={a} value={a}>
                  {a === "freediving" ? "Free Diving" : "Scuba"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Difficulty">
            <select
              value={fields.difficulty}
              onChange={(e) => update("difficulty", e.target.value)}
              className={`${inputCls} [color-scheme:dark]`}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Max Depth">
          <input
            type="text"
            value={fields.maxDepth}
            onChange={(e) => update("maxDepth", e.target.value)}
            placeholder="18m"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={fields.scheduledDate || ""}
              onChange={(e) => update("scheduledDate", e.target.value || null)}
              className={`${inputCls} [color-scheme:dark]`}
            />
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
              value={fields.price}
              onChange={(e) => update("price", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="Capacity">
            <input
              type="number"
              min={1}
              value={fields.capacity}
              onChange={(e) => update("capacity", Number(e.target.value))}
              className={inputCls}
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
              value={fields.visibility}
              onChange={(e) => update("visibility", e.target.value)}
              maxLength={20}
              placeholder="Visibility (e.g. 15m)"
              aria-label="Visibility"
              className={inputCls}
            />
            <input
              type="text"
              value={fields.waterTemp}
              onChange={(e) => update("waterTemp", e.target.value)}
              maxLength={20}
              placeholder="Water Temp (e.g. 27°C)"
              aria-label="Water Temp"
              className={inputCls}
            />
            <input
              type="text"
              value={fields.swell}
              onChange={(e) => update("swell", e.target.value)}
              maxLength={20}
              placeholder="Swell (e.g. 0.5m)"
              aria-label="Swell"
              className={inputCls}
            />
            <input
              type="text"
              value={fields.wind}
              onChange={(e) => update("wind", e.target.value)}
              maxLength={20}
              placeholder="Wind (e.g. 10kt SE)"
              aria-label="Wind"
              className={inputCls}
            />
            <input
              type="text"
              value={fields.tide}
              onChange={(e) => update("tide", e.target.value)}
              maxLength={20}
              placeholder="Tide (e.g. Low, 8:45am)"
              aria-label="Tide"
              className={inputCls}
            />
            <input
              type="text"
              value={fields.current}
              onChange={(e) => update("current", e.target.value)}
              maxLength={20}
              placeholder="Current (e.g. Mild)"
              aria-label="Current"
              className={inputCls}
            />
            <input
              type="text"
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
              value={fields.imageUrl}
              onChange={(e) => update("imageUrl", e.target.value)}
              placeholder="Image URL"
              aria-label="Image URL"
              className={inputCls}
            />
            <input
              type="text"
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
