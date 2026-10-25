import "server-only";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { type BackendEndpoint, backendHref, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import type { DefaultResponseType } from "@/core/types";
import { bearer, readBackendError } from "@/libs/backendSession";

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

// FE-3: the fetch-to-backend + token-forwarding + error-check + JSON-parse
// sequence below was copy-pasted into ~15 route.ts files. Callers still
// build their own path/method/body (some derive the path from query params
// or a request body, e.g. the analytics routes), this only replaces the
// part that was identical everywhere. The backend path comes from
// backendEndpoints (src/core/constants/backendEndpoints.ts), never a literal
// here. Assumes checkTokenPresence(req) has
// already been called -- callers still own that check and its ordering
// relative to their own request validation.
async function proxyToBackend<T>(
  req: NextRequest,
  endpoint: BackendEndpoint,
  init?: { method?: string; body?: BodyInit },
): Promise<T> {
  const token = req.cookies.get(tokenName);
  const response = await fetch(backendHref(endpoint), {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: bearer(token!.value),
    },
    body: init?.body,
  });
  if (!response.ok) {
    throw new HttpError(
      response.status,
      (await readBackendError(response)) ?? response.statusText,
    );
  }
  return (await response.json()) as T;
}

// The pages read every answer as { value, error }: that is what web-backend
// (Kotlin) wrapped everything in. The merged backend (the hub) answers with
// the data itself -- { series, title }, a list, a form -- so a route that
// forwards it untouched hands the page an object with no `value`, and the page
// fails ("reading 'series'" on the dashboard).
//
// Already { value } or { value, error }? Left alone. A group can still be
// pointed at web-backend (BACKEND_URL_<GROUP>), which wraps itself, and
// wrapping that again would put the data one level too deep. No payload the
// hub sends is shaped like that: its models carry real field names.
function isValueResponse(body: unknown): body is DefaultResponseType<unknown> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return false;
  }
  const keys = Object.keys(body);
  return (
    keys.includes("value") && keys.every((k) => k === "value" || k === "error")
  );
}

function valueResponse<T>(
  data: T | DefaultResponseType<T>,
): DefaultResponseType<T> {
  return isValueResponse(data)
    ? (data as DefaultResponseType<T>)
    : { value: data as T, error: null };
}

// proxyToBackend for the routes that hand the backend's answer straight to the
// page: the type argument is what the page reads ({ value, error }), and that
// is what comes back whichever backend answered. A route that needs the bare
// data (auth/me, reset-password turn it into something else) keeps using
// proxyToBackend.
async function proxyValueToBackend<
  R extends DefaultResponseType<unknown> = DefaultResponseType<unknown>,
>(
  req: NextRequest,
  endpoint: BackendEndpoint,
  init?: { method?: string; body?: BodyInit },
): Promise<R> {
  const data = await proxyToBackend<R["value"] | R>(req, endpoint, init);
  return valueResponse<R["value"]>(data) as R;
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

export {
  apiErrorResponse,
  checkTokenPresence,
  handleApiError,
  isValueResponse,
  proxyToBackend,
  proxyValueToBackend,
  valueResponse,
};
