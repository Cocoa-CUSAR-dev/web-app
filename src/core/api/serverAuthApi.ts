import "server-only";

import { backendUrl } from "../constants";
import { CustomRedirectError, HttpError } from "../error";
import { AuthResponseType } from "../types";

const serverAuthApi = {
  authMe: async (cookie: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/v1/auth/me`, {
        method: "GET",
        headers: {
          Cookie: cookie,
        },
      });
      if (!response.ok) {
        const { error } = await response.json();
        throw new HttpError(response.status, error ?? response.statusText);
      }
      return (await response.json())["value"] as AuthResponseType["value"];
    } catch (e) {
      if (e instanceof HttpError) {
        console.error("Backend Error:", `${e.status} ${e.message}`);
        if (e.status === 401) {
          throw new CustomRedirectError("/auth?page=login&clear=true");
        }
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
