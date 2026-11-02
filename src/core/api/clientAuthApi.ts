import "client-only";

import { fetchResponse } from "@/libs/fetchResponse";

type ResearcherSignupForm = {
  signupCode: string;
  firstName: string;
  lastName: string;
  organization: string;
};

// POST to one of this app's routes; throws an Error carrying the route's
// own message ({"error": "..."}), e.g. a wrong sign-up code.
async function postOrThrow(path: string, body: unknown): Promise<void> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.ok) return;
  let message = response.statusText;
  try {
    const data = (await response.json()) as { error?: string };
    if (data.error) message = data.error;
  } catch {
    // not JSON: keep the status text
  }
  throw new Error(message);
}

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
  /** Create a researcher account with the team's sign-up code; signed in after. */
  register: (email: string, password: string, signup: ResearcherSignupForm) =>
    postOrThrow("/api/v1/register", { email, password, ...signup }),
  /** Add the researcher role to the signed-in account. */
  becomeResearcher: (signup: ResearcherSignupForm) =>
    postOrThrow("/api/v1/me/roles/researcher", signup),
} as const;

export { clientAuthApi };
export type { ResearcherSignupForm };
