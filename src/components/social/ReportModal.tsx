"use client";

import { useState } from "react";
import { X, Flag } from "lucide-react";
import { useSocial } from "@/components/social/SocialContext";
import { REPORT_REASONS, submitReport } from "@/lib/social";

// Migrated from the old site's #report-modal (openReportModal()/
// submitReport()) -- reusable from a post's safety menu, a comment, or a
// public profile's menu, all via the SocialContext's openReport().
export function ReportModal() {
  const { reportTarget, closeReport } = useSocial();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!reportTarget) return null;

  async function handleSubmit() {
    if (!reason) {
      setError("Please choose a reason for this report.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitReport(reportTarget!.targetType, reportTarget!.targetId, reason, details.trim());
      setDone(true);
      setTimeout(() => {
        closeReport();
        setDone(false);
        setReason("");
        setDetails("");
      }, 1400);
    } catch (err) {
      console.error("Could not submit report:", err);
      setError(err instanceof Error ? err.message : "Could not submit your report -- please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Flag className="w-4 h-4 text-rose-400" /> Report {reportTarget.label}
          </h3>
          <button
            onClick={closeReport}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!done && (
          <p className="text-xs text-slate-400 leading-relaxed">
            Your report is sent to our moderation team for review -- the person you&apos;re
            reporting won&apos;t be notified.
          </p>
        )}

        {done ? (
          <p className="text-sm text-emerald-400 font-semibold text-center py-4">
            🚩 Report submitted -- thanks for helping keep UiDive safe.
          </p>
        ) : (
          <>
            {error && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                {error}
              </p>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
              >
                <option value="">Choose a reason…</option>
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Anything else we should know?"
                className="bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 bg-rose-500 hover:bg-rose-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-rose-500/20 transition-all"
            >
              {submitting ? "Submitting…" : "Submit Report"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
