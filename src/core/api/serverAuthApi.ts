import "server-only";

import { backendEndpoints, backendHref } from "../constants";
import { CustomRedirectError, HttpError } from "../error";
import { AuthResponseType } from "../types";

const AUTH_ME_TIMEOUT_MS = 10_000;

const serverAuthApi = {
  authMe: async (cookie: string) => {
    try {
      const response = await fetch(backendHref(backendEndpoints.auth.me), {
        method: "GET",
        headers: {
          Cookie: cookie,
        },
        // Every authenticated page waits on this before rendering. Without
        // a limit, a backend that is asleep or hung leaves the page blank
        // for as long as it takes to answer; this fails it after 10s so
        // AuthWrapper can send the visitor on instead.
        signal: AbortSignal.timeout(AUTH_ME_TIMEOUT_MS),
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new HttpError(response.status, error ?? response.statusText);
      }
      return (await response.json())["value"] as AuthResponseType["value"];
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
