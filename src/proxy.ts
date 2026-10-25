import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { publicPaths, refreshTokenName, tokenName } from "./core/constants";
import {
  clearSessionCookies,
  requestRefresh,
  setSessionCookies,
  type TokenPair,
} from "./libs/backendSession";

// Files the browser asks for before it has any session to speak of: asking
// the backend for a new token pair for each of them would be pure noise.
const NO_REFRESH_PREFIXES = [
  "/_next",
  "/images/",
  "/logos/",
  "/map/",
  "/.well-known/",
];

// The access cookie expires with the access token. When it is gone but the
// refresh cookie is still here, this swaps the refresh token for a new pair
// before the request goes on, so the page or API route it reaches sees a
// signed-in person and the browser gets the new cookies. If the backend
// refuses, the request goes on as signed out.
export async function proxy(req: NextRequest) {
  const { cookies, nextUrl } = req;
  const refreshToken = cookies.get(refreshTokenName)?.value;

  let refreshed: TokenPair | null = null;
  if (
    !cookies.get(tokenName) &&
    refreshToken &&
    !NO_REFRESH_PREFIXES.some((prefix) => nextUrl.pathname.startsWith(prefix))
  ) {
    refreshed = await requestRefresh(refreshToken);
  }

  const hasToken = Boolean(cookies.get(tokenName)) || refreshed !== null;
  const response = route(req, hasToken);

  if (refreshed) {
    // A request that goes straight on must carry the new cookies too, or the
    // page it reaches would still see none.
    const out =
      response.headers.get("x-middleware-next") === "1"
        ? NextResponse.next({
            request: { headers: headersWithSession(req, refreshed) },
          })
        : response;
    setSessionCookies(out, refreshed);
    return out;
  }
  // A refused refresh leaves the cookies alone, on purpose: the refusal can be
  // a request that lost a race with a parallel one, whose new cookies are on
  // their way to the browser, and clearing here would sign the person out.
  // A refresh token that really is dead is replaced by the next sign-in, or
  // cleared when the backend rejects the session (/auth?clear=true).
  return response;
}

function headersWithSession(req: NextRequest, pair: TokenPair): Headers {
  const headers = new Headers(req.headers);
  const kept = req.cookies
    .getAll()
    .filter(({ name }) => name !== tokenName && name !== refreshTokenName)
    .map(({ name, value }) => `${name}=${value}`);
  kept.push(`${tokenName}=${pair.access_token}`);
  kept.push(`${refreshTokenName}=${pair.refresh_token}`);
  headers.set("cookie", kept.join("; "));
  return headers;
}

function route(req: NextRequest, token: boolean) {
  const { nextUrl } = req;
  const { searchParams, pathname } = nextUrl;

  // development purpose
  const NODE_ENV = process.env.NODE_ENV;
  if (pathname.startsWith("/debug") && NODE_ENV === "development") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth") && searchParams.get("clear") === "true") {
    const newUrl = new URL(req.url);
    newUrl.searchParams.delete("clear");

    const response = NextResponse.redirect(newUrl);

    clearSessionCookies(response);

    return response;
  }

  const matchedPath = publicPaths.find((p) =>
    p.type === "EXACT"
      ? pathname === p.path
      : pathname.trim().startsWith(p.path),
  );

  if (pathname.startsWith("/auth")) {
    if (token && searchParams.get("page") !== "reset-password") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (!token && searchParams.get("page") === "reset-password") {
      return NextResponse.redirect(new URL("/auth?page=login", req.url));
    }

    const pageParam = searchParams.get("page");
    if (
      !pageParam ||
      !["login", "register", "reset-password"].includes(pageParam)
    ) {
      return NextResponse.redirect(new URL("/auth?page=login", req.url));
    }

    return NextResponse.next();
  }

  if (!token && !matchedPath) {
    return NextResponse.redirect(new URL("/auth?page=login", req.url));
  }

  return NextResponse.next();
}
