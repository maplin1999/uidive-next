"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { HostApplicationFields, HostDocType, submitHostApplication } from "@/lib/host";

const HOST_TYPES = ["Dive Shop", "Independent Instructor", "Charter Operator"];

// Migrated from the old site's #host-application-modal / submitHostApplication().
// The three verification documents (cert card, insurance, business registration)
// are optional on submit -- the old site treated them the same way, letting a
// host apply first and attach docs whenever they have them handy.
export function HostApplicationForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const { user } = useAuth();
  const [fields, setFields] = useState<HostApplicationFields>({
    hostType: HOST_TYPES[0],
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <h3 className="font-bold text-white text-base">Become a Host</h3>
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
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>

        <Field label="Business / Operator Name">
          <input
            type="text"
            value={fields.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            placeholder="Blue Reef Dive Co."
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </Field>

        <Field label="Bio / Description">
          <textarea
            value={fields.displayBio}
            onChange={(e) => update("displayBio", e.target.value)}
            rows={3}
            className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Website">
            <input
              type="text"
              value={fields.website}
              onChange={(e) => update("website", e.target.value)}
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
          <Field label="Location">
            <input
              type="text"
              value={fields.location}
              onChange={(e) => update("location", e.target.value)}
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Cert Agency">
            <input
              type="text"
              value={fields.certAgency}
              onChange={(e) => update("certAgency", e.target.value)}
              placeholder="PADI, SSI..."
              className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </Field>
          <Field label="Cert Number">
            <input
              type="text"
              value={fields.certNumber}
              onChange={(e) => update("certNumber", e.target.value)}
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

        <div className="grid grid-cols-2 gap-3">
          <Field label="Business Reg. Number">
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

        <div className="space-y-2 border-t border-slate-800 pt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Verification Documents (optional)
          </p>
          <DocUpload
            label="Certification Card"
            onChange={(f) => setFiles((prev) => ({ ...prev, cert_card: f }))}
          />
          <DocUpload
            label="Insurance"
            onChange={(f) => setFiles((prev) => ({ ...prev, insurance: f }))}
          />
          <DocUpload
            label="Business Registration"
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
  return (
    <div className="flex items-center justify-between gap-3 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3">
      <span className="text-xs font-semibold text-slate-300">{label}</span>
      <input
        type="file"
        onChange={(e) => onChange(e.target.files?.[0])}
        className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-cyan-500/10 file:text-cyan-400 max-w-[55%]"
      />
    </div>
  );
}
