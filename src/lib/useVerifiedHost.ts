"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { fetchHostStatus } from "@/lib/host";

// Shared by Header (desktop nav) and MobileNav (bottom tab bar) so the
// "Host Dashboard" nav link only ever shows for an actually-verified host --
// mirrors the old site's isVerifiedHost flag (renderProfileBadges(), toggled
// on .host-nav-el) rather than just gating on "signed in at all".
export function useVerifiedHost(): boolean {
  const { user } = useAuth();
  const [isVerifiedHost, setIsVerifiedHost] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsVerifiedHost(false);
      return;
    }
    let cancelled = false;
    fetchHostStatus(user.id)
      .then((status) => {
        if (!cancelled) setIsVerifiedHost(status?.verification_status === "verified");
      })
      .catch((err) => console.error("Could not check host status:", err));
    return () => {
      cancelled = true;
    };
  }, [user]);

  return isVerifiedHost;
}
