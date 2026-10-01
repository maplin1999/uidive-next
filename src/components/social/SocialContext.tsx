"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { ReportTargetType } from "@/lib/social";

interface ReportTarget {
  targetType: ReportTargetType;
  targetId: string;
  label: string;
}

interface SocialContextValue {
  profileUserId: string | null;
  openProfile: (userId: string) => void;
  closeProfile: () => void;
  reportTarget: ReportTarget | null;
  openReport: (targetType: ReportTargetType, targetId: string, label: string) => void;
  closeReport: () => void;
}

const SocialContext = createContext<SocialContextValue | null>(null);

// A thin global context (same pattern as AuthContext's modal state) so any
// component -- a trip card's "Hosted by" line, a post author's name, a
// buddy-request row -- can open the public profile modal or the report
// modal without prop-drilling callbacks down through every page.
export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user, requireAuth } = useAuth();
  const router = useRouter();
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

  // Mirrors viewPublicProfile(): viewing your own id just goes to your real
  // Profile page instead of opening the read-only public-profile modal.
  const openProfile = useCallback(
    (userId: string) => {
      if (user && userId === user.id) {
        router.push("/profile");
        return;
      }
      setProfileUserId(userId);
    },
    [user, router]
  );

  const closeProfile = useCallback(() => setProfileUserId(null), []);

  const openReport = useCallback(
    (targetType: ReportTargetType, targetId: string, label: string) => {
      if (!requireAuth()) return;
      setReportTarget({ targetType, targetId, label });
    },
    [requireAuth]
  );

  const closeReport = useCallback(() => setReportTarget(null), []);

  return (
    <SocialContext.Provider
      value={{ profileUserId, openProfile, closeProfile, reportTarget, openReport, closeReport }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within a SocialProvider");
  return ctx;
}
