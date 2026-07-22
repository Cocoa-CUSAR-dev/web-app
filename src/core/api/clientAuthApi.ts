import "client-only";

import { fetchResponse } from "@/libs/fetchResponse";

const clientAuthApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetchResponse("/api/v1/login", {
        method: "POST",
        body: JSON.stringify({
          username: email,
          password,
        }),
      });
      if (!response) {
        throw new Error("can't log in");
      }
      return true;
    } catch (e) {
      console.error(
        e instanceof Error ? `${e.name}: ${e.message}` : "Unknown Error",
      );
      return false;
    }
  },
} as const;

export { clientAuthApi };
