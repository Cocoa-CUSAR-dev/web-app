import "server-only";

import { backendEndpoints, backendHref } from "@/core/constants";
import { HttpError } from "@/core/error";
import { readBackendError, type TokenPair } from "@/libs/backendSession";

// Researchers sign themselves up with a code the project team gives out
// (backend-hub's RESEARCHER_SIGNUP_CODE). The backend adds the researcher
// role with POST /me/roles/researcher and answers with a new token pair that
// already holds the role. Used by sign-up (a new account) and by "become a
// researcher" (someone already signed in, e.g. a farmer).

type ResearcherSignup = {
  signupCode: string;
  firstName: string;
  lastName: string;
  organization: string;
};

/** The first missing field's name, or null when all are filled. */
function missingSignupField(body: Partial<ResearcherSignup>): string | null {
  for (const key of [
    "signupCode",
    "firstName",
    "lastName",
    "organization",
  ] as const) {
    if (typeof body[key] !== "string" || !body[key]?.trim()) return key;
  }
  return null;
}

async function backendPost(
  path: Parameters<typeof backendHref>[0],
  body: unknown,
  accessToken?: string,
): Promise<Response> {
  return fetch(backendHref(path), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function failure(response: Response): Promise<HttpError> {
  return new HttpError(
    response.status,
    (await readBackendError(response)) ?? response.statusText,
  );
}

/** Add the researcher role to the signed-in account. The new token pair, or
 * null when the account already is a researcher (409): nothing to change. */
async function addResearcherRole(
  accessToken: string,
  signup: ResearcherSignup,
): Promise<TokenPair | null> {
  const response = await backendPost(
    backendEndpoints.me.role("researcher"),
    {
      signup_code: signup.signupCode.trim(),
      first_name: signup.firstName.trim(),
      last_name: signup.lastName.trim(),
      organization: signup.organization.trim(),
    },
    accessToken,
  );
  if (response.status === 409) return null;
  if (!response.ok) throw await failure(response);
  return (await response.json()) as TokenPair;
}

/** Create the account and sign it in. If the email is already registered
 * and the password matches, sign that account in instead: a sign-up whose
 * code was wrong left an account without a role, and trying again with the
 * right code must still work. */
async function createOrSignIn(
  username: string,
  password: string,
): Promise<TokenPair> {
  const created = await backendPost(backendEndpoints.auth.register, {
    username,
    password,
  });
  if (created.ok) return (await created.json()) as TokenPair;
  if (created.status !== 409) throw await failure(created);

  const signedIn = await backendPost(backendEndpoints.auth.login, {
    username,
    password,
  });
  // A wrong password for a taken email: report "already registered", not
  // "wrong password", since this is the sign-up form.
  if (!signedIn.ok)
    throw await failure(signedIn.status === 401 ? created : signedIn);
  return (await signedIn.json()) as TokenPair;
}

export { addResearcherRole, createOrSignIn, missingSignupField };
export type { ResearcherSignup };
