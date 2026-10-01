"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { fetchBuddyRequests, fetchBuddies, fetchConversations } from "@/lib/inbox";

// Shared by Header (desktop nav) and MobileNav (bottom tab bar) so both
// badges poll the same way and stay in sync, instead of each running its
// own independent interval. Mirrors the old site's updateInboxBadges().
export function useInboxBadge(): number {
  const { user } = useAuth();
  const [inboxBadge, setInboxBadge] = useState(0);

  useEffect(() => {
    if (!user) {
      setInboxBadge(0);
      return;
    }
    let cancelled = false;
    async function check() {
      try {
        const [requests, buddies] = await Promise.all([fetchBuddyRequests(user!.id), fetchBuddies(user!.id)]);
        const conversations = await fetchConversations(user!.id, buddies);
        const unread = conversations.filter((c) => c.unread).length;
        if (!cancelled) setInboxBadge(requests.length + unread);
      } catch (err) {
        console.error("Could not check Inbox badge:", err);
      }
    }
    check();
    const interval = setInterval(check, 25000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user]);

  return inboxBadge;
}
