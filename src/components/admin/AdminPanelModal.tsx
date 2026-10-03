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
import { useEscapeClose } from "@/lib/useEscapeClose";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useLocale } from "@/components/i18n/LocaleContext";

type AdminTab = "hosts" | "reports";

// Migrated from the old site's #admin-host-review-modal (openAdminHostReviewModal()):
// host-application verification and reported-content moderation, in one
// tabbed panel reachable from the admin badge next to the admin's name.
export function AdminPanelModal({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  const TARGET_LABELS: Record<string, string> = {
    post: t.adminPanel.targetPost,
    comment: t.adminPanel.targetComment,
    user: t.adminPanel.targetUser,
  };
  const [tab, setTab] = useState<AdminTab>("hosts");
  const [applications, setApplications] = useState<PendingHostApplication[]>([]);
  const [reports, setReports] = useState<PendingReport[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [openDocsFor, setOpenDocsFor] = useState<string | null>(null);
  const [docs, setDocs] = useState<Record<string, HostApplicationDocument[]>>({});
  // Tracks whichever single application/report row currently has an
  // approve/reject/dismiss/remove request in flight, so only that row's
  // buttons disable -- these actions each take a round trip (and rejection
  // pops a window.prompt first), so without this a second click while the
  // first is still pending could fire the mutation twice.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ reportId: string; targetType: string } | null>(null);
  const { message, showToast } = useToast();

  useEscapeClose(onClose);

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
    if (busyId) return;
    setBusyId(hostUserId);
    try {
      await approveHostApplication(hostUserId);
      showToast(t.adminPanel.hostApprovedToast);
      load();
    } catch (err) {
      console.error("Could not approve this application:", err);
      showToast(err instanceof Error ? `❌ ${err.message}` : t.adminPanel.couldNotApprove);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(hostUserId: string) {
    if (busyId) return;
    const reason = window.prompt(t.adminPanel.rejectReasonPrompt, "");
    if (reason === null) return;
    setBusyId(hostUserId);
    try {
      await rejectHostApplication(hostUserId, reason);
      showToast(t.adminPanel.applicationRejectedToast);
      load();
    } catch (err) {
      console.error("Could not reject this application:", err);
      showToast(err instanceof Error ? `❌ ${err.message}` : t.adminPanel.couldNotReject);
    } finally {
      setBusyId(null);
    }
  }

  async function handleReviewReport(reportId: string, action: "dismiss" | "remove", targetType: string) {
    if (busyId) return;
    if (action === "remove") {
      setConfirmRemove({ reportId, targetType });
      return;
    }
    setBusyId(reportId);
    try {
      await reviewReport(reportId, action);
      showToast(t.adminPanel.reportDismissedToast);
      load();
    } catch (err) {
      console.error("Could not review this report:", err);
      showToast(err instanceof Error ? `❌ ${err.message}` : t.adminPanel.couldNotReviewReport);
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmRemove() {
    if (!confirmRemove) return;
    const { reportId } = confirmRemove;
    setBusyId(reportId);
    try {
      await reviewReport(reportId, "remove");
      showToast(t.adminPanel.contentRemovedToast);
      setConfirmRemove(null);
      load();
    } catch (err) {
      console.error("Could not review this report:", err);
      showToast(err instanceof Error ? `❌ ${err.message}` : t.adminPanel.couldNotReviewReport);
    } finally {
      setBusyId(null);
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
              <ShieldCheck className="w-4 h-4 text-violet-400" /> {t.adminPanel.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{t.adminPanel.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t.adminPanel.close}
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
            {t.adminPanel.tabHostApplications}
          </button>
          <button
            type="button"
            onClick={() => setTab("reports")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              tab === "reports" ? "bg-cyan-500 text-slate-950" : "text-slate-400"
            }`}
          >
            {t.adminPanel.tabReports}
            {reports.length > 0 && (
              <span className="text-[10px] font-bold bg-rose-500 text-white rounded-full px-1.5 py-0.5 min-w-[1.1rem] text-center leading-none">
                {reports.length}
              </span>
            )}
          </button>
        </div>

        {status === "loading" && <p className="text-xs text-slate-500 text-center py-6">{t.profile.loading}</p>}
        {status === "error" && (
          <p className="text-xs text-rose-400 text-center py-6">{t.adminPanel.loadError}</p>
        )}

        {status === "ready" && tab === "hosts" && (
          <div className="space-y-3">
            {applications.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">{t.adminPanel.noApplications}</p>
            )}
            {applications.map((app) => {
              const applicant = app.profiles || { name: t.adminPanel.unknownDiver, avatar_url: "" };
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
                        {applicant.name || t.adminPanel.unknownDiver}
                        {app.business_name ? ` -- ${app.business_name}` : ""}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">
                        {app.host_type} • {app.location || t.adminPanel.noLocationGiven}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{app.display_bio || t.adminPanel.noBioGiven}</p>
                  <p className="text-[10px] text-slate-500">
                    {app.cert_agency || t.adminPanel.noAgencyGiven} #{app.cert_number || "—"} •{" "}
                    {app.years_experience || 0} {t.adminPanel.yrsExperienceSuffix}
                  </p>
                  <button
                    onClick={() => handleViewDocs(app.user_id)}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300"
                  >
                    {t.adminPanel.viewDocuments}
                  </button>
                  {openDocsFor === app.user_id && (
                    <div className="space-y-1 pl-2 border-l-2 border-slate-800">
                      {!applicantDocs && <p className="text-[10px] text-slate-500">{t.profile.loading}</p>}
                      {applicantDocs?.length === 0 && (
                        <p className="text-[10px] text-slate-500">{t.adminPanel.noDocumentsUploaded}</p>
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
                              {d.file_name || t.adminPanel.viewFile}
                            </a>
                          ) : (
                            <span className="text-slate-600">{t.adminPanel.linkUnavailable}</span>
                          )}
                        </p>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleApprove(app.user_id)}
                      disabled={busyId === app.user_id}
                      className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                    >
                      {busyId === app.user_id ? t.adminPanel.approving : t.adminPanel.approve}
                    </button>
                    <button
                      onClick={() => handleReject(app.user_id)}
                      disabled={busyId === app.user_id}
                      className="flex-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-60 border border-rose-500/40 text-rose-300 font-bold rounded-xl text-xs transition-colors"
                    >
                      {busyId === app.user_id ? t.adminPanel.rejecting : t.adminPanel.reject}
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
              <p className="text-xs text-slate-500 text-center py-6">{t.adminPanel.noReports}</p>
            )}
            {reports.map((r) => {
              const reporter = r.profiles?.name || t.adminPanel.fallbackDiver;
              const when = new Date(r.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              const targetLabel = TARGET_LABELS[r.target_type] || r.target_type;
              return (
                <div key={r.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white">{targetLabel} {t.adminPanel.reportedSuffix}</p>
                    <span className="text-[10px] text-slate-500">{when}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-slate-200">{t.adminPanel.reasonLabel}</strong> {r.reason}
                  </p>
                  {r.details && (
                    <p className="text-xs text-slate-400">
                      <strong className="text-slate-200">{t.adminPanel.detailsLabel}</strong> {r.details}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-500">
                    {t.adminPanel.reportedByPrefix} {reporter} • {t.adminPanel.targetIdPrefix} {r.target_id}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleReviewReport(r.id, "dismiss", r.target_type)}
                      disabled={busyId === r.id}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-slate-200 font-bold rounded-xl text-xs transition-colors"
                    >
                      {busyId === r.id ? t.adminPanel.dismissing : t.adminPanel.dismiss}
                    </button>
                    {r.target_type !== "user" && (
                      <button
                        onClick={() => handleReviewReport(r.id, "remove", r.target_type)}
                        disabled={busyId === r.id}
                        className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                      >
                        {busyId === r.id ? t.adminPanel.removing : `${t.adminPanel.removePrefix} ${targetLabel}`}
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

      {confirmRemove && (
        <ConfirmModal
          title={`${t.adminPanel.deleteReportTitlePrefix} ${confirmRemove.targetType === "user" ? t.adminPanel.deleteUserReportNoun : confirmRemove.targetType}?`}
          message={t.adminPanel.cannotBeUndone}
          confirmLabel={t.adminPanel.delete}
          confirming={busyId === confirmRemove.reportId}
          onConfirm={handleConfirmRemove}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </div>
  );
}
