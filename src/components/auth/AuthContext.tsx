"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { DiverProfile, DEFAULT_AVATAR } from "@/lib/auth-types";

export type AuthModalTab = "signin" | "signup";

interface AuthContextValue {
  user: DiverProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: AuthModalTab;
  openAuthModal: (tab?: AuthModalTab) => void;
  closeAuthModal: () => void;
  // Central gate, same job as the old site's requireAuth(): call before any
  // action that needs a signed-in user. Opens the sign-in modal and returns
  // false if nobody's signed in, so callers can bail out early.
  requireAuth: () => boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Fetches the profiles row for a Supabase auth user and shapes it into the
// flat object the rest of the UI expects -- same job as the old app.js's
// fetchProfile().
async function fetchProfile(authUser: User): Promise<DiverProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "name, cert, location, bio, avatar_url, dives, max_depth, corals, last_daily_claim, account_type, is_admin"
    )
    .eq("id", authUser.id)
    .single();

  if (error || !data) {
    console.error("Could not load profile:", error);
    return null;
  }

  return {
    id: authUser.id,
    email: authUser.email || "",
    name: data.name,
    cert: data.cert,
    location: data.location,
    bio: data.bio,
    avatar: data.avatar_url || DEFAULT_AVATAR,
    dives: data.dives,
    max_depth: data.max_depth,
    corals: data.corals,
    last_daily_claim: data.last_daily_claim,
    account_type: data.account_type || "diver",
    is_admin: !!data.is_admin,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DiverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<AuthModalTab>("signin");

  const applySession = useCallback(async (authUser: User | null) => {
    if (authUser) {
      const profile = await fetchProfile(authUser);
      setUser(profile);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Restores a previous session on load, same as the old site's
    // restoreSession().
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      await applySession(session?.user ?? null);
      setLoading(false);
    });

    // Keeps the UI in sync if the user signs in/out in another tab, or if
    // their session expires.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const openAuthModal = useCallback((tab: AuthModalTab = "signin") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => setIsAuthModalOpen(false), []);

  const requireAuth = useCallback(() => {
    if (user) return true;
    openAuthModal("signin");
    return false;
  }, [user, openAuthModal]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await applySession(session?.user ?? null);
  }, [applySession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
