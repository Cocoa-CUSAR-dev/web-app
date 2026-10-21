"use client";

import { useEffect, useState } from "react";

import type { AuthResponseType } from "@/core/types";
import { AuthInfoProvider } from "@/hooks/useAuthInfo";

// For public pages that only *adjust* to login state (the landing page's
// "Log In" vs "Open Dashboard"). It replaces OptionalAuthWrapper, which asked
// the backend on the server before sending anything; this renders the
// anonymous version straight away and asks from the browser afterwards.
// The page can then be prerendered and served from the CDN, instead of every
// visit waiting on a server render plus web-backend's /auth/me (which, with
// a sleeping backend, meant a blank page for as long as it took to wake up).
function ClientAuthInfoProvider({ children }: { children: React.ReactNode }) {
  const [authData, setAuthData] = useState<AuthResponseType["value"]>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/v1/auth/me", { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: AuthResponseType | null) => {
        if (body?.value) setAuthData(body.value);
      })
      // Anonymous is already what's shown; a failed check changes nothing.
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return <AuthInfoProvider value={authData}>{children}</AuthInfoProvider>;
}

export default ClientAuthInfoProvider;
