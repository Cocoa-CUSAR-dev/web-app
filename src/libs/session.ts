// Talking to backend-hub's auth API and keeping its tokens.
//
// backend-hub returns tokens in the response body (no cookies) and reads only
// `Authorization: Bearer`. The browser never sees the tokens: our Next routes
// put them in this app's own HttpOnly cookies, and every server-side call
// sends the access token as Bearer. src/proxy.ts refreshes it before it runs
// out, so pages and API routes always see a live one.

import type { NextResponse } from "next/server";

import { hubUrl, refreshTokenName, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import type { AuthResponseType, UserRole } from "@/core/types";

// Refresh this long before the access token expires, so a request that
// starts just before expiry doesn't fail halfway.
const REFRESH_MARGIN_SECONDS = 60;
// The hub slides the refresh token's life on every use (90 days).
const REFRESH_COOKIE_MAX_AGE = 90 * 24 * 60 * 60;

type SessionUser = {
  user_id: string;
  username: string;
  roles: UserRole[];
  must_reset_password: boolean;
};

type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: SessionUser;
};

type HubMe = SessionUser & {
  profiles: {
    researcher?: {
      first_name?: string | null;
      last_name?: string | null;
      organization?: string | null;
    } | null;
  };
};

type AuthUserValue = NonNullable<AuthResponseType["value"]>;

/** Error message from either backend: the hub says `detail`, Kotlin `error`. */
async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string; error?: string };
    return body.detail ?? body.error ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

async function hubFetch(
  path: string,
  init: { method?: string; body?: unknown; accessToken?: string } = {},
): Promise<Response> {
  return fetch(`${hubUrl}${path}`, {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init.accessToken
        ? { Authorization: `Bearer ${init.accessToken}` }
        : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
}

/** POST to a hub auth endpoint that answers with a token pair; throws HttpError otherwise. */
async function requestTokenPair(
  path: string,
  body: unknown,
  accessToken?: string,
  method = "POST",
): Promise<TokenPair> {
  const response = await hubFetch(path, { method, body, accessToken });
  if (!response.ok) {
    throw new HttpError(response.status, await readError(response));
  }
  return (await response.json()) as TokenPair;
}

/** Swap a refresh token for a new pair, or null if the hub refuses it. */
async function refreshSession(refreshToken: string): Promise<TokenPair | null> {
  try {
    const response = await hubFetch("/api/v1/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
    return response.ok ? ((await response.json()) as TokenPair) : null;
  } catch {
    return null;
  }
}

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

function setSessionCookies(
  response: NextResponse,
  pair: TokenPair,
): NextResponse {
  response.cookies.set(
    tokenName,
    pair.access_token,
    cookieOptions(pair.expires_in),
  );
  response.cookies.set(
    refreshTokenName,
    pair.refresh_token,
    cookieOptions(REFRESH_COOKIE_MAX_AGE),
  );
  return response;
}

function clearSessionCookies(response: NextResponse): NextResponse {
  response.cookies.delete(tokenName);
  response.cookies.delete(refreshTokenName);
  return response;
}

/** Seconds until the access token's `exp`, or -1 if it can't be read. Not a
 * signature check -- the hub does that -- only "is it worth sending". */
function secondsLeft(accessToken: string | undefined): number {
  if (!accessToken) {
    return -1;
  }
  try {
    const payload = accessToken.split(".")[1];
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as {
      exp?: number;
    };
    return typeof json.exp === "number" ? json.exp - Date.now() / 1000 : -1;
  } catch {
    return -1;
  }
}

function needsRefresh(accessToken: string | undefined): boolean {
  return secondsLeft(accessToken) < REFRESH_MARGIN_SECONDS;
}

/** The hub's /me in the shape the UI already uses (AuthUser). */
function toAuthUser(me: HubMe): AuthUserValue {
  const researcher = me.profiles?.researcher ?? null;
  return {
    userId: me.user_id,
    email: me.username,
    firstName: researcher?.first_name ?? "",
    lastName: researcher?.last_name ?? "",
    organization: researcher?.organization ?? "",
    roles: me.roles,
    isRequiresPasswordReset: me.must_reset_password,
    isPasswordReset: !me.must_reset_password,
  };
}

/** The signed-in user from the hub, or throws HttpError (401 = not signed in). */
async function fetchMe(
  accessToken: string,
  signal?: AbortSignal,
): Promise<AuthUserValue> {
  const response = await fetch(`${hubUrl}/api/v1/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    signal,
  });
  if (!response.ok) {
    throw new HttpError(response.status, await readError(response));
  }
  return toAuthUser((await response.json()) as HubMe);
}

export {
  clearSessionCookies,
  fetchMe,
  hubFetch,
  needsRefresh,
  readError,
  refreshSession,
  requestTokenPair,
  setSessionCookies,
  toAuthUser,
};
export type { HubMe, TokenPair };
