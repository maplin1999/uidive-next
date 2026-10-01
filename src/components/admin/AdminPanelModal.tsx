"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { DEFAULT_AVATAR } from "@/lib/auth-types";
import {
  PendingHostApplication,
  PendingReport,
  HostApplicationDocument,
  fetchPendingHostApplications,
  fetchPendingReports,
  fetchHostApplicationDocuments,
  approveHostApplication,
  rejectHostApplication,
  reviewReport,
} from "@/lib/admin";
import { useToast, Toast } from "@/components/Toast";

type AdminTab = "hosts" | "reports";

const TARGET_LABELS: Record<string, string> = { post: "Post", comment: "Comment", user: "User" };

// Migrated from the old site's #admin-host-review-modal (openAdminHostReviewModal()):
// host-application verification and reported-content moderation, in one
// tabbed panel reachable from the admin badge next to the admin's name.
export function AdminPanelModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<AdminTab>("hosts");
  const [applications, setApplications] = useState<PendingHostApplication[]>([]);
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [openDocsFor, setOpenDocsFor] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, HostApplicationDocument[]>>({});
  const { message, showToast } = useToast();

  function load() {
    setStatus("loading");
    Promise.all([fetchPendingHostApplications(), fetchPendingReports()])
      .then(([apps, reps]) => {
        setApplications(apps);
        setReports(reps);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load admin panel:", err);
        setStatus("error");
      });
  }

  useEffect(() => {
    load();
  }, []);

  async function handleViewDocs(hostUserId: string) {
    if (openDocsFor === hostUserId) {
      setOpenDocsFor(null);
      return;
    }
    setOpenDocsFor(hostUserId);
    if (!docs[hostUserId]) {
      try {
        const fetched = await fetchHostApplicationDocuments(hostUserId);
        setDocs((prev) => ({ ...prev, [hostUserId]: fetched }));
      } catch (err) {
        console.error("Could not load application documents:", err);
      }
    }
  }

  async function handleApprove(hostUserId: string) {
    try {
      await approveHostApplication(hostUserId);
      showToast("✅ Host approved.");
      load();
    } catch (err) {
      console.error("Could not approve this application:", err);
      showToast(err instanceof Error ? `❌ ${err.message}` : "❌ Could not approve this application.");
    }
  }

  async function handleReject(hostUserId: string) {
    const reason = window.prompt("Reason for rejection (shown to the applicant):", "");
    if (reason === null) return;
    try {
      await rejectHostApplication(hostUserId, reason);
      showToast("Application rejected.");
      load();
    } catch (err) {
      console.error("Could not reject this application:", err);
      showToast(err instanceof Error ? `❌ ${err.message}` : "❌ Could not reject this application.");
    }
  }

  async function handleReviewReport(reportId: string, action: "dismiss" | "remove", targetType: string) {
    if (action === "remove") {
      const label = targetType === "user" ? "this user's report" : `this ${targetType}`;
      if (!window.confirm(`Permanently delete ${label}? This can't be undone.`)) return;
    }
    try {
      await reviewReport(reportId, action);
      showToast(action === "remove" ? "🗑️ Content removed." : "Report dismissed.");
      load();
    } catch (err) {
      console.error("Could not review this report:", err);
      showToast(err instanceof Error ? `❌ ${err.message}` : "❌ Could not review this report.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3.5">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-400" /> Admin Panel
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Host verifications &amp; reported content</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setTab("hosts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
              tab === "hosts" ? "bg-cyan-500 text-slate-950" : "text-slate-400"
            }`}
          >
            Host Applications
          </button>
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              tab === "reports" ? "bg-cyan-500 text-slate-950" : "text-slate-400"
            }`}
          >
            Reports
            {reports.length > 0 && (
              <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center leading-none">
                {reports.length}
              </span>
            )}
          </button>
        </div>

        {status === "loading" && <p className="text-xs text-slate-500 text-center py-6">Loading…</p>}
        {status === "error" && (
          <p className="text-xs text-rose-400 text-center py-6">Could not load the admin panel.</p>
        )}

        {status === "ready" && tab === "hosts" && (
          <div className="space-y-3">
            {applications.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No pending applications right now.</p>
            )}
            {applications.map((app) => {
              const applicant = app.profiles || { name: "Unknown diver", avatar_url: "" };
              const applicantDocs = docs[app.user_id];
              return (
                <div key={app.user_id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={applicant.avatar_url || DEFAULT_AVATAR}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {applicant.name || "Unknown diver"}
                        {app.business_name ? ` -- ${app.business_name}` : ""}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">
                        {app.host_type} • {app.location || "No location given"}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{app.display_bio || "No bio given."}</p>
                  <p className="text-[10px] text-slate-500">
                    {app.cert_agency || "No agency given"} #{app.cert_number || "—"} •{" "}
                    {app.years_experience || 0} yrs experience
                  </p>
                  <button
                    onClick={() => handleViewDocs(app.user_id)}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    View Documents
                  </button>
                  {openDocsFor === app.user_id && (
                    <div className="space-y-1 pl-2 border-l-2 border-slate-800">
                      {!applicantDocs && <p className="text-[10px] text-slate-500">Loading…</p>}
                      {applicantDocs?.length === 0 && (
                        <p className="text-[10px] text-slate-500">No documents uploaded.</p>
                      )}
                      {applicantDocs?.map((d) => (
                        <p key={d.doc_type} className="text-[10px]">
                          <span className="text-slate-500 uppercase font-bold">{d.doc_type}:</span>{" "}
                          {d.url ? (
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noopener"
                              className="text-cyan-400 hover:underline"
                            >
                              {d.file_name || "view file"}
                            </a>
                          ) : (
                            <span className="text-slate-600">link unavailable</span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(app.user_id)}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(app.user_id)}
                      className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {status === "ready" && tab === "reports" && (
          <div className="space-y-3">
            {reports.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No pending reports right now.</p>
            )}
            {reports.map((r) => {
              const reporter = r.profiles?.name || "A diver";
              const when = new Date(r.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const targetLabel = TARGET_LABELS[r.target_type] || r.target_type;
              return (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white">{targetLabel} reported</p>
                    <span className="text-[10px] text-slate-500">{when}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-200">Reason:</strong> {r.reason}
                  </p>
                  {r.details && (
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-200">Details:</strong> {r.details}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    Reported by {reporter} • target id {r.target_id}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleReviewReport(r.id, "dismiss", r.target_type)}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
                    >
                      Dismiss
                    </button>
                    {r.target_type !== "user" && (
                      <button
                        onClick={() => handleReviewReport(r.id, "remove", r.target_type)}
                        className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                      >
                        Remove {targetLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Toast message={message} />
    </div>
  );
}
