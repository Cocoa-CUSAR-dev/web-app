import "server-only";

import { fetchMe } from "@/libs/session";

import { CustomRedirectError, HttpError } from "../error";

const AUTH_ME_TIMEOUT_MS = 10_000;

const serverAuthApi = {
  /** The signed-in user from backend-hub's /me, for server components.
   * src/proxy.ts has already refreshed an expiring access token. */
  authMe: async (accessToken: string | undefined) => {
    try {
      if (!accessToken) {
        throw new HttpError(401, "not signed in");
      }
      // Every authenticated page waits on this before rendering. Without a
      // limit, a backend that is asleep or hung leaves the page blank for as
      // long as it takes to answer; this fails it after 10s so AuthWrapper
      // can send the visitor on instead.
      return await fetchMe(accessToken, AbortSignal.timeout(AUTH_ME_TIMEOUT_MS));
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
