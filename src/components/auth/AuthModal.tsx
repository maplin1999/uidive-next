"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Waves, Eye, EyeOff, Zap } from "lucide-react";
import { useEscapeClose } from "@/lib/useEscapeClose";
import { supabase } from "@/lib/supabase";
import { DEMO_ACCOUNT, CERT_OPTIONS } from "@/lib/auth-types";
import { useAuth } from "@/components/auth/AuthContext";
import { useLocale } from "@/components/i18n/LocaleContext";
import type { Dictionary } from "@/lib/i18n/translations/en";

// Migrated from the old site's #auth-modal: sign in / sign up tabs, demo
// account autofill, forgot password, and the "check your email" wait state
// for projects with email confirmation turned on. All in one modal/view
// state machine instead of a second separate modal + polling interval,
// which keeps this a single self-contained component.
export function AuthModal() {
  const { t } = useLocale();
  const { isAuthModalOpen, authModalTab, closeAuthModal, openAuthModal, refreshProfile } =
    useAuth();
  const [view, setView] = useState<"form" | "confirm">("form");
  const [pendingEmail, setPendingEmail] = useState("");

  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [signinShowPassword, setSigninShowPassword] = useState(false);
  const [signinError, setSigninError] = useState("");
  const [signinLoading, setSigninLoading] = useState(false);

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signupCert, setSignupCert] = useState(CERT_OPTIONS[0]);
  const [signupLocation, setSignupLocation] = useState("");
  const [signupShowPassword, setSignupShowPassword] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);

  useEscapeClose(handleClose);

  if (!isAuthModalOpen) return null;

  function handleClose() {
    closeAuthModal();
    setView("form");
    setSigninError("");
    setSignupError("");
  }

  function fillDemoAccount() {
    setSigninEmail(DEMO_ACCOUNT.email);
    setSigninPassword(DEMO_ACCOUNT.password);
  }

  async function handleForgotPassword() {
    const email = signinEmail.trim().toLowerCase();
    if (!email) {
      setSigninError(t.authModal.forgotEmailFirst);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      setSigninError(error.message);
      return;
    }
    handleClose();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSigninError("");
    const email = signinEmail.trim().toLowerCase();
    if (!email || !signinPassword) {
      setSigninError(t.authModal.pleaseEnterBoth);
      return;
    }

    setSigninLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: signinPassword,
    });
    setSigninLoading(false);

    if (error) {
      setSigninError(t.authModal.incorrectCredentials);
      return;
    }

    await refreshProfile();
    handleClose();
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSignupError("");

    const name = signupName.trim();
    const email = signupEmail.trim().toLowerCase();

    if (!name || !email || !signupPassword || !signupConfirm) {
      setSignupError(t.authModal.pleaseFillRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSignupError(t.authModal.invalidEmail);
      return;
    }
    if (signupPassword.length < 6) {
      setSignupError(t.authModal.passwordTooShort);
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError(t.authModal.passwordsDontMatch);
      return;
    }

    setSignupLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password: signupPassword,
      options: {
        data: {
          name,
          cert: signupCert || "Open Water Diver",
          location: signupLocation.trim() || "Location not set",
        },
      },
    });
    setSignupLoading(false);

    if (error) {
      setSignupError(
        error.message.includes("already registered")
          ? t.authModal.alreadyRegistered
          : error.message
      );
      return;
    }

    if (data.session) {
      await refreshProfile();
      handleClose();
    } else {
      // Email confirmation is on for this Supabase project -- no session
      // yet until they click the link in their inbox.
      setPendingEmail(email);
      setView("confirm");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl modal-spring max-h-[90vh] overflow-y-auto">
        {view === "confirm" ? (
          <ConfirmEmailView email={pendingEmail} onClose={handleClose} t={t} />
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2.5">
                <Image
                  src="/assets/images/uidive-logo.svg"
                  alt="UiDive"
                  width={48}
                  height={48}
                  priority
                />
                <div>
                  <h3 className="font-black text-white text-base leading-none">
                    {t.authModal.welcomeHeading}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t.authModal.welcomeSubtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label={t.common.close}
                className="p-2.5 rounded-full bg-slate-800 text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex border-b border-slate-800">
              <button
                type="button"
                onClick={() => openAuthModal("signin")}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  authModalTab === "signin"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.authModal.signIn}
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-colors ${
                  authModalTab === "signup"
                    ? "border-cyan-400 text-cyan-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.authModal.signUp}
              </button>
            </div>

            {authModalTab === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-3">
                {signinError && (
                  <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                    {signinError}
                  </p>
                )}

                <Field label={t.authModal.email}>
                  <input
                    type="email"
                    value={signinEmail}
                    onChange={(e) => setSigninEmail(e.target.value)}
                    placeholder={t.authModal.emailPlaceholder}
                    className={inputClass}
                  />
                </Field>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t.authModal.password}
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[10px] font-bold text-cyan-400 hover:underline"
                    >
                      {t.authModal.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={signinShowPassword ? "text" : "password"}
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setSigninShowPassword((v) => !v)}
                      tabIndex={-1}
                      aria-label={signinShowPassword ? t.authModal.hidePassword : t.authModal.showPassword}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {signinShowPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={signinLoading}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {signinLoading ? t.authModal.signingIn : t.authModal.signIn}
                </button>
                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> {t.authModal.tryDemoAccount}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3">
                {signupError && (
                  <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-2 rounded-xl">
                    {signupError}
                  </p>
                )}

                <Field label={t.authModal.fullName}>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={t.authModal.fullNamePlaceholder}
                    className={inputClass}
                  />
                </Field>
                <Field label={t.authModal.email}>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder={t.authModal.emailPlaceholder}
                    className={inputClass}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={t.authModal.password}>
                    <div className="relative">
                      <input
                        type={signupShowPassword ? "text" : "password"}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder={t.authModal.passwordPlaceholder}
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setSignupShowPassword((v) => !v)}
                        tabIndex={-1}
                        aria-label={signupShowPassword ? t.authModal.hidePassword : t.authModal.showPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {signupShowPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field label={t.authModal.confirmLabel}>
                    <input
                      type={signupShowPassword ? "text" : "password"}
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      placeholder={t.authModal.confirmPasswordPlaceholder}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={t.authModal.certification}>
                    <select
                      value={signupCert}
                      onChange={(e) => setSignupCert(e.target.value)}
                      className={`${inputClass} [color-scheme:dark]`}
                    >
                      {CERT_OPTIONS.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t.authModal.location}>
                    <input
                      type="text"
                      value={signupLocation}
                      onChange={(e) => setSignupLocation(e.target.value)}
                      placeholder={t.authModal.locationPlaceholder}
                      className={inputClass}
                    />
                  </Field>
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
                >
                  {signupLoading ? t.authModal.creatingAccount : t.authModal.createAccount}
                </button>
                <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                  {t.authModal.signupDisclaimerPrefix}{" "}
                  <span className="text-amber-400 font-bold">{t.authModal.corals}</span>
                  {t.authModal.signupDisclaimerAnd}{" "}
                  <Link
                    href="/terms-of-service"
                    target="_blank"
                    rel="noopener"
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    {t.authModal.termsOfService}
                  </Link>{" "}
                  {t.authModal.and}{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener"
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    {t.authModal.privacyPolicy}
                  </Link>
                  .
                </p>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ConfirmEmailView({
  email,
  onClose,
  t,
}: {
  email: string;
  onClose: () => void;
  t: Dictionary;
}) {
  return (
    <div className="space-y-4 text-center py-4">
      <Image
        src="/assets/images/uidive-logo.svg"
        alt="UiDive"
        width={48}
        height={48}
        priority
      />
      <div>
        <h3 className="font-black text-white text-base">{t.authModal.checkYourEmail}</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          {t.authModal.confirmationSentPrefix} <span className="text-slate-200 font-semibold">{email}</span>.{" "}
          {t.authModal.confirmationSentSuffix}
        </p>
      </div>
      <button
        onClick={onClose}
        className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm shadow-lg shadow-cyan-500/20 transition-all"
      >
        {t.authModal.gotIt}
      </button>
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

const inputClass =
  "bg-slate-950 w-full px-4 py-3 rounded-xl border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-cyan-500";
