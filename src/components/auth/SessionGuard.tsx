"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const SESSION_KEY = "nu-robot-session-active";
const LOGIN_INITIATED_KEY = "nu-robot-login-initiated";

/**
 * SessionGuard Component
 *
 * Detects if a user has returned to the site after closing their browser tab
 * or browser window, and forces an automatic sign-out.
 *
 * How it works:
 * - Uses two `sessionStorage` flags (both tab-scoped, cleared on tab/browser close):
 *   1. "nu-robot-login-initiated" — set by GoogleLoginButton BEFORE the OAuth redirect
 *   2. "nu-robot-session-active"  — set here AFTER login is confirmed
 *
 * - On mount, if the user is authenticated:
 *   a) "login-initiated" flag exists → fresh login → set "session-active", clear "login-initiated"
 *   b) "session-active" flag exists  → same tab, normal navigation → do nothing
 *   c) Neither flag exists           → tab/browser was closed → force sign-out
 */
export default function SessionGuard() {
  const { status } = useSession();

  useEffect(() => {
    // Only run when the session status has resolved (not "loading")
    if (status === "loading") return;

    if (status === "authenticated") {
      const isTabSessionActive = sessionStorage.getItem(SESSION_KEY);
      const isLoginInitiated = sessionStorage.getItem(LOGIN_INITIATED_KEY);

      if (isTabSessionActive) {
        // [SUCCESS] Same tab session — user is navigating within the site, do nothing
        return;
      }

      if (isLoginInitiated) {
        // [SUCCESS] Fresh login — user just completed OAuth and returned
        // Set the "session-active" flag and clean up the "login-initiated" flag
        sessionStorage.setItem(SESSION_KEY, "true");
        sessionStorage.removeItem(LOGIN_INITIATED_KEY);
        return;
      }

      // [ERROR] No flags at all — this means the tab/browser was closed previously
      // and the user reopened the site with a stale cookie → force sign-out
      signOut({ callbackUrl: "/login" });
      return;
    }

    // When user signs out manually, clean up all flags
    if (status === "unauthenticated") {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(LOGIN_INITIATED_KEY);
    }
  }, [status]);

  return null; // This is a logic-only component, no UI
}
