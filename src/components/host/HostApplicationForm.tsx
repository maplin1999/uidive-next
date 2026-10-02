"use client";

import { useState } from "react";
import { Anchor, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { HostApplicationFields, HostDocType, submitHostApplication } from "@/lib/host";
import { useEscapeClose } from "@/lib/useEscapeClose";

// Values (not just labels) must match the old site's #host-app-type exactly --
// host_profiles.host_type is a real stored enum, read back elsewhere (admin
// panel, host badges), not just display text.
const HOST_TYPES = [
  { value: "divemaster", label: "Independent Divemaster" },
  { value: "shop", label: "Dive Shop" },
  { value: "both", label: "Both" },
];

// Migrated from the old site's #host-application-modal / submitHostApplication().
// The three verification documents (cert card, insurance, business registration)
// are optional on submit -- the old site treated them the same way, letting a
// host apply first and attach docs whenever they have them handy.
export function HostApplicationForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const { user } = useAuth();
  const [fields, setFields] = useState<HostApplicationFields>({
    hostType: HOST_TYPES[0].value,
    businessName: "",
    displayBio: "",
    website: "",
    location: user?.location || "",
    certAgency: "",
    certNumber: "",
    businessRegNumber: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    yearsExperience: 0,
  });
  const [files, setFiles] = useState<Partial<Record<HostDocType, File>>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEscapeClose(onClose);

  if (!user) return null;

  function update<K extends keyof HostApplicationFields>(key: K, value: HostApplicationFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!fields.businessName.trim()) {
      setError("Business / operator name is required.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitHostApplication(user!.id, fields, files);
      onSubmitted();
    } catch (err) {
      console.error("Could not submit host application:", err);
      setError("Could not submit your application -- please try again.");
    } finally {
      setSubmitting(false);
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
              <Anchor className="w-4 h-4 text-cyan-400" /> Become a Host
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Apply as a verified Dive Shop or Divemaster</p>
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

        <Field label="Host Type">
          <select
            value={fields.hostType}
            onChange={(e) => update("hostType", e.target.value)}
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
          >
            {HOST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Business Name (if applicable)">
          <input
            type="text"
            value={fields.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            placeholder="e.g. Manly Dive Centre"
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </Field>

        <Field label="About You / Your Shop">
          <textarea
            value={fields.displayBio}
            onChange={(e) => update("displayBio", e.target.value)}
            rows={2}
            placeholder="Tell divers what makes your trips worth booking"
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Location">
            <input
              type="text"
              value={fields.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Sydney, NSW"
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
          <Field label="Website (optional)">
            <input
              type="url"
              value={fields.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://"
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
        </div>

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-800 pt-3">
          Certification
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Certifying Agency">
            <input
              type="text"
              value={fields.certAgency}
              onChange={(e) => update("certAgency", e.target.value)}
              placeholder="PADI, SSI, NAUI..."
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
          <Field label="Cert / Pro Number">
            <input
              type="text"
              value={fields.certNumber}
              onChange={(e) => update("certNumber", e.target.value)}
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
        </div>

        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-t border-slate-800 pt-3">
          Business &amp; Insurance
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Business Registration # (optional)">
            <input
              type="text"
              value={fields.businessRegNumber}
              onChange={(e) => update("businessRegNumber", e.target.value)}
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
          <Field label="Years Experience">
            <input
              type="number"
              min={0}
              value={fields.yearsExperience}
              onChange={(e) => update("yearsExperience", Number(e.target.value))}
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Insurance Provider">
            <input
              type="text"
              value={fields.insuranceProvider}
              onChange={(e) => update("insuranceProvider", e.target.value)}
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
          <Field label="Policy Number">
            <input
              type="text"
              value={fields.insurancePolicyNumber}
              onChange={(e) => update("insurancePolicyNumber", e.target.value)}
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
        </div>

        <div className="space-y-2 border-t border-slate-800 pt-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supporting Documents</p>
          <DocUpload
            label="Cert / Pro card photo"
            onChange={(f) => setFiles((prev) => ({ ...prev, cert_card: f }))}
          />
          <DocUpload
            label="Insurance certificate"
            onChange={(f) => setFiles((prev) => ({ ...prev, insurance: f }))}
          />
          <DocUpload
            label="Business registration (optional)"
            onChange={(f) => setFiles((prev) => ({ ...prev, business_registration: f }))}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>
      </div>
    </div>
  );
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

function DocUpload({ label, onChange }: { label: string; onChange: (f: File | undefined) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);
  return (
    <div className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
      <span className="text-[10px] text-slate-400">{label}</span>
      <label className="text-[10px] font-bold text-cyan-400 cursor-pointer min-w-0 max-w-[55%] flex justify-end">
        <span className="truncate">{fileName || "No file selected"}</span>
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            setFileName(f ? f.name : null);
            onChange(f);
          }}
        />
      </label>
    </div>
  );
}
