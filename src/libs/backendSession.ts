import type { NextResponse } from "next/server";

import {
  backendEndpoints,
  backendHref,
  refreshCookieMaxAgeSeconds,
  refreshTokenName,
  tokenName,
} from "@/core/constants";

// The backend keeps no cookies. Every login-like call (login, refresh,
// reset-password, sso exchange) answers with a token pair in its body, and
// this app keeps the pair in its own HttpOnly cookies, then sends the access
// token to the backend as a Bearer header. This file is the one place that
// reads that answer, writes those cookies and asks for a new pair.

type BackendSessionUser = {
  user_id: string;
  username: string;
  roles: string[];
  must_reset_password: boolean;
};

type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  // Seconds until the access token expires.
  expires_in: number;
  user: BackendSessionUser;
};

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

// The access cookie lives exactly as long as the access token, so a missing
// cookie means "expired" and the proxy asks for a new pair with the refresh
// cookie, which lives as long as the refresh token.
function setSessionCookies(response: NextResponse, pair: TokenPair) {
  response.cookies.set(tokenName, pair.access_token, {
    ...cookieOptions(),
    maxAge: pair.expires_in,
  });
  response.cookies.set(refreshTokenName, pair.refresh_token, {
    ...cookieOptions(),
    maxAge: refreshCookieMaxAgeSeconds,
  });
}

function clearSessionCookies(response: NextResponse) {
  response.cookies.delete(tokenName);
  response.cookies.delete(refreshTokenName);
}

// FastAPI answers errors with {"detail": "..."} (a list for a request that
// failed validation); the old backend used {"error": "..."}.
async function readBackendError(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as {
      detail?: unknown;
      error?: unknown;
    };
    if (typeof body.detail === "string") return body.detail;
    if (typeof body.error === "string") return body.error;
  } catch {
    // not JSON: fall through to the status text
  }
  return null;
}

// A page that loads right after the access cookie expired makes several
// requests at once (the page, its data, images), and every one of them reaches
// the proxy with the same refresh token. The backend uses a refresh token up
// on first use and refuses a second one, so without this the first request
// would win and the rest would be turned away. Requests that arrive while one
// refresh is running, or within a few seconds after it, share its answer. The
// window is much shorter than the backend's own grace for a repeated token.
const SHARED_REFRESH_MS = 10_000;
const recentRefreshes = new Map<
  string,
  { startedAt: number; result: Promise<TokenPair | null> }
>();

// null when the refresh token is unknown, expired or used up.
function requestRefresh(refreshToken: string): Promise<TokenPair | null> {
  const now = Date.now();
  for (const [token, { startedAt }] of recentRefreshes) {
    if (now - startedAt > SHARED_REFRESH_MS) recentRefreshes.delete(token);
  }
  const shared = recentRefreshes.get(refreshToken);
  if (shared) return shared.result;

  const result = fetchNewPair(refreshToken);
  recentRefreshes.set(refreshToken, { startedAt: now, result });
  // A refusal is not worth sharing: let the next request ask again.
  void result.then((pair) => {
    if (!pair) recentRefreshes.delete(refreshToken);
  });
  return result;
}

// Tests only: forget the answers being shared.
function clearSharedRefreshes() {
  recentRefreshes.clear();
}

async function fetchNewPair(refreshToken: string): Promise<TokenPair | null> {
  try {
    const response = await fetch(backendHref(backendEndpoints.auth.refresh), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) return null;
    return (await response.json()) as TokenPair;
  } catch {
    return null;
  }
}

function bearer(accessToken: string) {
  return `Bearer ${accessToken}`;
}

export type { BackendSessionUser, TokenPair };
export {
  bearer,
  clearSessionCookies,
  clearSharedRefreshes,
  readBackendError,
  requestRefresh,
  setSessionCookies,
};
