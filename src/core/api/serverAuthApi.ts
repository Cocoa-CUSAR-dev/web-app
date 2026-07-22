import "server-only";

import { CustomRedirectError, HttpError } from "../error";
import { AuthResponseType } from "../types";

const BACKEND_URL = process.env.BACKEND_URL;

const serverAuthApi = {
  authMe: async (cookie: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
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
