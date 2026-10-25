import "server-only";

import { type BackendMe, toAuthValue } from "@/libs/authAdapter";
import { readBackendError } from "@/libs/backendSession";

import { backendEndpoints, backendHref, tokenName } from "../constants";
import { CustomRedirectError, HttpError } from "../error";
import { AuthResponseType } from "../types";

const AUTH_ME_TIMEOUT_MS = 10_000;

// `cookie` is the request's whole Cookie header; the backend wants just the
// access token, as a Bearer header.
function tokenFromCookies(cookie: string): string {
  const prefix = `${tokenName}=`;
  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? match.slice(prefix.length) : "";
}

const serverAuthApi = {
  authMe: async (cookie: string) => {
    try {
      const response = await fetch(backendHref(backendEndpoints.me.self), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenFromCookies(cookie)}`,
        },
        // Every authenticated page waits on this before rendering. Without
        // a limit, a backend that is asleep or hung leaves the page blank
        // for as long as it takes to answer; this fails it after 10s so
        // AuthWrapper can send the visitor on instead.
        signal: AbortSignal.timeout(AUTH_ME_TIMEOUT_MS),
      });
      if (!response.ok) {
        throw new HttpError(
          response.status,
          (await readBackendError(response)) ?? response.statusText,
        );
      }
      return toAuthValue(
        (await response.json()) as BackendMe,
      ) satisfies AuthResponseType["value"];
    } catch (e) {
      if (e instanceof HttpError) {
        if (e.status === 401) {
          // Not logged in -- the expected, normal case for an anonymous
          // visitor, not a bug worth logging as an error.
          throw new CustomRedirectError("/auth?page=login&clear=true");
        }
        console.error("Backend Error:", `${e.status} ${e.message}`);
      } else {
        console.error(
          e instanceof Error ? `${e.name}: ${e.message}` : "Unknown Error",
        );
      }
      return null;
    }
  },
};

export { serverAuthApi };
