import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { publicPaths, refreshTokenName, tokenName } from "./core/constants";
import {
  clearSessionCookies,
  needsRefresh,
  refreshSession,
  setSessionCookies,
  type TokenPair,
} from "./libs/session";

// Static files never need a fresh session; skip the refresh check for them.
function isAsset(pathname: string): boolean {
  return pathname.startsWith("/_next") || /\.[a-z0-9]+$/i.test(pathname);
}

/**
 * Keeps the backend-hub session alive: when the access token is missing or
 * about to expire and there is a refresh token, swap it for a new pair here,
 * before any page or API route runs. The new access token is written into
 * this request (so AuthWrapper and the route handlers see it) and into the
 * response (so the browser keeps it). A refused refresh token signs out.
 */
async function freshSession(
  req: NextRequest,
): Promise<{ pair: TokenPair | null; signedOut: boolean }> {
  const access = req.cookies.get(tokenName)?.value;
  const refresh = req.cookies.get(refreshTokenName)?.value;
  if (!refresh || !needsRefresh(access) || isAsset(req.nextUrl.pathname)) {
    return { pair: null, signedOut: false };
  }
  const pair = await refreshSession(refresh);
  if (pair) {
    req.cookies.set(tokenName, pair.access_token);
    req.cookies.set(refreshTokenName, pair.refresh_token);
    return { pair, signedOut: false };
  }
  req.cookies.delete(tokenName);
  req.cookies.delete(refreshTokenName);
  return { pair: null, signedOut: true };
}

export async function proxy(req: NextRequest) {
  const session = await freshSession(req);
  const finish = (response: NextResponse) => {
    if (session.pair) {
      return setSessionCookies(response, session.pair);
    }
    return session.signedOut ? clearSessionCookies(response) : response;
  };
  // Pass the (possibly refreshed) cookies on to the page or route handler.
  const next = () =>
    finish(NextResponse.next({ request: { headers: req.headers } }));

  const { nextUrl, cookies } = req;
  const { searchParams, pathname } = nextUrl;
  const token = cookies.get(tokenName);

  // development purpose
  const NODE_ENV = process.env.NODE_ENV;
  if (pathname.startsWith("/debug") && NODE_ENV === "development") {
    return next();
  }

  if (pathname.startsWith("/auth") && searchParams.get("clear") === "true") {
    const newUrl = new URL(req.url);
    newUrl.searchParams.delete("clear");

    return clearSessionCookies(NextResponse.redirect(newUrl));
  }

  const matchedPath = publicPaths.find((p) =>
    p.type === "EXACT"
      ? pathname === p.path
      : pathname.trim().startsWith(p.path),
  );

  if (pathname.startsWith("/auth")) {
    if (token && searchParams.get("page") !== "reset-password") {
      return finish(NextResponse.redirect(new URL("/dashboard", req.url)));
    }
    if (!token && searchParams.get("page") === "reset-password") {
      return finish(
        NextResponse.redirect(new URL("/auth?page=login", req.url)),
      );
    }

    const pageParam = searchParams.get("page");
    if (
      !pageParam ||
      !["login", "register", "reset-password"].includes(pageParam)
    ) {
      return finish(
        NextResponse.redirect(new URL("/auth?page=login", req.url)),
      );
    }

    return next();
  }

  if (!token && !matchedPath) {
    return finish(NextResponse.redirect(new URL("/auth?page=login", req.url)));
  }

  return next();
}
