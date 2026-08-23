import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";

function checkTokenPresence(req: NextRequest) {
  const token = req.cookies.get(tokenName);
  if (!token || !token.name || !token.value) {
    throw new HttpError(401, "missing authentication token");
  }
}

function handleApiError(e: unknown) {
  if (e instanceof HttpError) {
    console.error(`HTTP ${e.status}: ${e.message}`);
  } else {
    console.error(
      e instanceof Error ? `${e.name}: ${e.message}` : "Unkown Error",
    );
  }
}

// FE-3: the fetch-to-backend + Cookie-forwarding + error-check + JSON-parse
// sequence below was copy-pasted into ~15 route.ts files. Callers still
// build their own path/method/body (some derive the path from query params
// or a request body, e.g. the analytics routes), this only replaces the
// part that was identical everywhere. Assumes checkTokenPresence(req) has
// already been called -- callers still own that check and its ordering
// relative to their own request validation.
async function proxyToBackend<T>(
  req: NextRequest,
  path: string,
  init?: { method?: string; body?: BodyInit },
): Promise<T> {
  const token = req.cookies.get(tokenName);
  const response = await fetch(`${backendUrl}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `${token!.name}=${token!.value}`,
    },
    body: init?.body,
  });
  if (!response.ok) {
    const { error } = await response.json();
    const setCookie = response.headers.getSetCookie();
    throw new HttpError(response.status, error ?? response.statusText, setCookie);
  }
  return (await response.json()) as T;
}

// FE-3: the catch-block shape below was copy-pasted into all 18 route.ts
// files (including login/logout/register, whose success path stays custom
// since they forward the backend's Set-Cookie directly rather than
// returning parsed JSON).
function apiErrorResponse(e: unknown): NextResponse {
  handleApiError(e);
  if (e instanceof HttpError) {
    const res = NextResponse.json({ error: e.message }, { status: e.status });
    if (e.setCookies && e.setCookies.length > 0) {
      e.setCookies.forEach((cookieString) => {
        res.headers.append("Set-Cookie", cookieString);
      });
    }
    return res;
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

export { apiErrorResponse, checkTokenPresence, handleApiError, proxyToBackend };
