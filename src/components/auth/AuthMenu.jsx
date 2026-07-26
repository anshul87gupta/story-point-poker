import React, { useState, useEffect } from "react";
import { User, LogIn, UserPlus, LogOut, X } from "lucide-react";
import { C } from "../../theme";
import { api } from "../../api/client";

/* feature: clickable profile icon, now backed by real Sanctum SPA (cookie) auth.
   Still self-contained (its own state) so it can't affect any other part of the app —
   the game/room state and the account-auth state remain deliberately separate concerns. */
export default function AuthMenu({ t }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu"); // menu | signin | signup
  const [user, setUser] = useState(null); // null = signed out
  const [checkingSession, setCheckingSession] = useState(true);

  const [fullNameField, setFullNameField] = useState("");
  const [emailField, setEmailField] = useState("");
  const [passwordField, setPasswordField] = useState("");
  const [confirmPasswordField, setConfirmPasswordField] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Check for an existing session on mount, so a page refresh doesn't lose the sign-in —
  // this is the real fix for what used to just be local component state before.
  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        /* 401 just means signed out — not an error worth surfacing */
      })
      .finally(() => {
        if (!cancelled) setCheckingSession(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function close() {
    setOpen(false);
    setView("menu");
    setFormError(null);
  }

  function resetFields() {
    setFullNameField("");
    setEmailField("");
    setPasswordField("");
    setConfirmPasswordField("");
  }

  // Real keyboard support for dismissing the menu, since the backdrop div below is
  // intentionally mouse/touch-only (see comment there).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function firstFieldError(err, field) {
    return err?.errors?.[field]?.[0] || null;
  }

  async function handleSignIn() {
    setSubmitting(true);
    setFormError(null);
    try {
      const data = await api.login({ email: emailField, password: passwordField });
      setUser(data.user);
      resetFields();
      setView("menu"); // show the signed-in confirmation, don't hide the whole popover
    } catch (err) {
      setFormError(firstFieldError(err, "email") || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSignUp() {
    setSubmitting(true);
    setFormError(null);
    try {
      const data = await api.register({
        name: fullNameField,
        email: emailField,
        password: passwordField,
        password_confirmation: confirmPasswordField,
      });
      setUser(data.user);
      resetFields();
      setView("menu"); // show the signed-in confirmation, don't hide the whole popover
    } catch (err) {
      setFormError(firstFieldError(err, "name") || firstFieldError(err, "email") || firstFieldError(err, "password") || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogOut() {
    setSubmitting(true);
    try {
      await api.logout();
    } catch {
      /* best-effort — clear local state regardless, session is likely already gone */
    } finally {
      setUser(null);
      setSubmitting(false);
      close();
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stops the click from reaching anything behind the menu; the actual controls inside are all real, keyboard-accessible buttons
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: C.bg }}
        aria-label={t.signIn}
        disabled={checkingSession}
      >
        <User className="w-4 h-4" style={{ color: C.textMuted }} />
      </button>

      {open && (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- mouse/touch-only click-outside-to-dismiss backdrop; Escape (handled above) and the visible close controls are the keyboard path */}
          <div className="fixed inset-0 z-30" onClick={close} />
          <div className="absolute right-0 top-full mt-2 z-40 w-72 bg-white rounded shadow-lg border p-4" style={{ borderColor: C.border }}>
            {view === "menu" &&
              (user ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: C.primary }}
                    >
                      {(user.name || user.email || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: C.navy }}>
                        {user.name}
                      </div>
                      <div className="text-xs truncate" style={{ color: C.textMuted }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogOut}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium rounded px-3 py-2 border"
                    style={{ borderColor: C.border, color: C.alarmText, opacity: submitting ? 0.6 : 1 }}
                  >
                    <LogOut className="w-4 h-4" /> {t.logOut}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setView("signin")}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium rounded px-3 py-2 text-white"
                    style={{ backgroundColor: C.primary }}
                  >
                    <LogIn className="w-4 h-4" /> {t.signIn}
                  </button>
                  <button
                    onClick={() => setView("signup")}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium rounded px-3 py-2 border"
                    style={{ borderColor: C.border, color: C.navy }}
                  >
                    <UserPlus className="w-4 h-4" /> {t.signUp}
                  </button>
                </div>
              ))}

            {(view === "signin" || view === "signup") && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-sm" style={{ color: C.navy }}>
                    {view === "signin" ? t.signIn : t.signUp}
                  </span>
                  <button type="button" onClick={() => setView("menu")} style={{ color: C.textMuted }} aria-label={t.close}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {view === "signup" && (
                  <input
                    value={fullNameField}
                    onChange={(e) => setFullNameField(e.target.value)}
                    placeholder={t.fullName}
                    className="w-full mb-2 rounded px-2 py-1.5 text-sm border focus:outline-none"
                    style={{ borderColor: C.border, color: C.navy }}
                  />
                )}
                <input
                  type="email"
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                  placeholder={t.email}
                  className="w-full mb-2 rounded px-2 py-1.5 text-sm border focus:outline-none"
                  style={{ borderColor: C.border, color: C.navy }}
                />
                <input
                  type="password"
                  value={passwordField}
                  onChange={(e) => setPasswordField(e.target.value)}
                  placeholder={t.password}
                  className="w-full mb-2 rounded px-2 py-1.5 text-sm border focus:outline-none"
                  style={{ borderColor: C.border, color: C.navy }}
                />
                {view === "signup" && (
                  <input
                    type="password"
                    value={confirmPasswordField}
                    onChange={(e) => setConfirmPasswordField(e.target.value)}
                    placeholder={t.confirmPassword}
                    className="w-full mb-2 rounded px-2 py-1.5 text-sm border focus:outline-none"
                    style={{ borderColor: C.border, color: C.navy }}
                  />
                )}
                {view === "signin" && (
                  <button type="button" className="text-xs underline mb-2 block" style={{ color: C.primary }}>
                    {t.forgotPassword}
                  </button>
                )}

                {formError && (
                  <p className="text-xs mb-2" style={{ color: C.alarmText }}>
                    {formError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={view === "signin" ? handleSignIn : handleSignUp}
                  disabled={submitting}
                  className="w-full text-sm font-medium rounded px-3 py-2 text-white mb-3"
                  style={{ backgroundColor: C.primary, opacity: submitting ? 0.6 : 1 }}
                >
                  {submitting ? "..." : view === "signin" ? t.signIn : t.createAccount}
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
                  <span className="text-xs" style={{ color: C.textFaint }}>
                    {t.orContinueWith}
                  </span>
                  <div className="h-px flex-1" style={{ backgroundColor: C.border }} />
                </div>

                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    className="flex-1 text-xs font-medium rounded px-2 py-1.5 border"
                    style={{ borderColor: C.border, color: C.navy }}
                  >
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex-1 text-xs font-medium rounded px-2 py-1.5 border"
                    style={{ borderColor: C.border, color: C.navy }}
                  >
                    Microsoft
                  </button>
                  <button
                    type="button"
                    className="flex-1 text-xs font-medium rounded px-2 py-1.5 border"
                    style={{ borderColor: C.border, color: C.navy }}
                  >
                    GitHub
                  </button>
                </div>

                <div className="text-center text-xs" style={{ color: C.textMuted }}>
                  {view === "signin" ? (
                    <>
                      {t.newHere}{" "}
                      <button type="button" onClick={() => setView("signup")} className="underline font-medium" style={{ color: C.primary }}>
                        {t.signUp}
                      </button>
                    </>
                  ) : (
                    <>
                      {t.alreadyHaveAccount}{" "}
                      <button type="button" onClick={() => setView("signin")} className="underline font-medium" style={{ color: C.primary }}>
                        {t.signIn}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
