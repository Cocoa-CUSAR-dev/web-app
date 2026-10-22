import { NextRequest } from "next/server";

import { refreshTokenName, tokenName } from "@/core/constants";
import type { TokenPair } from "@/libs/backendSession";

/** Builds a NextRequest for API route handler tests, optionally pre-authenticated. */
function makeApiRequest(
  url: string,
  {
    method = "GET",
    body,
    token,
    refreshToken,
  }: {
    method?: string;
    body?: unknown;
    token?: string;
    refreshToken?: string;
  } = {},
) {
  const req = new NextRequest(new URL(url, "http://localhost"), {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (token) {
    req.cookies.set(tokenName, token);
  }
  if (refreshToken) {
    req.cookies.set(refreshTokenName, refreshToken);
  }
  return req;
}

/** What every login-like endpoint of the backend answers with. */
function tokenPair(overrides: Partial<TokenPair> = {}): TokenPair {
  return {
    access_token: "access-1",
    refresh_token: "refresh-1",
    token_type: "bearer",
    expires_in: 3600,
    user: {
      user_id: "u-1",
      username: "r@test.com",
      roles: ["researcher"],
      must_reset_password: false,
    },
    ...overrides,
  };
}

export { makeApiRequest, tokenPair };
