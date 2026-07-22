import React, { useState, useEffect } from "react";
import { User, LogIn, UserPlus, LogOut, X } from "lucide-react";
import { C } from "../../theme";

/* feature: clickable profile icon — UI only, no backend yet. Self-contained state so it
   can't affect any other part of the app. */
export default function AuthMenu({ t }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu"); // menu | signin | signup
  const [signedIn, setSignedIn] = useState(false);
  const [emailField, setEmailField] = useState("");

  function close() {
    setOpen(false);
    setView("menu");
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

  function handleSignIn() {
    setSignedIn(true);
    close();
  }
  function handleSignUp() {
    setSignedIn(true);
    close();
  }
  function handleLogOut() {
    setSignedIn(false);
    setEmailField("");
    close();
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stops the click from reaching anything behind the menu; the actual controls inside are all real, keyboard-accessible buttons
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-6 h-6 rounded-full flex items-center justify-center"
        style={{ backgroundColor: C.bg }}
        aria-label={t.signIn}
      >
        <User className="w-4 h-4" style={{ color: C.textMuted }} />
      </button>

      {open && (
        <>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- mouse/touch-only click-outside-to-dismiss backdrop; Escape (handled above) and the visible close controls are the keyboard path */}
          <div className="fixed inset-0 z-30" onClick={close} />
          <div className="absolute right-0 top-full mt-2 z-40 w-72 bg-white rounded shadow-lg border p-4" style={{ borderColor: C.border }}>
            {view === "menu" &&
              (signedIn ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: C.primary }}
                    >
                      {(emailField || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-sm truncate" style={{ color: C.navy }}>
                      {emailField || "you@example.com"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogOut}
                    className="w-full flex items-center justify-center gap-2 text-sm font-medium rounded px-3 py-2 border"
                    style={{ borderColor: C.border, color: C.alarmText }}
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
                  placeholder={t.password}
                  className="w-full mb-2 rounded px-2 py-1.5 text-sm border focus:outline-none"
                  style={{ borderColor: C.border, color: C.navy }}
                />
                {view === "signup" && (
                  <input
                    type="password"
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
                <button
                  type="button"
                  onClick={view === "signin" ? handleSignIn : handleSignUp}
                  className="w-full text-sm font-medium rounded px-3 py-2 text-white mb-3"
                  style={{ backgroundColor: C.primary }}
                >
                  {view === "signin" ? t.signIn : t.createAccount}
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
