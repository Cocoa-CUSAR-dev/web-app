export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { apiErrorResponse } from "@/libs/apiUtil";
import { setSessionCookies } from "@/libs/backendSession";
import {
  addResearcherRole,
  createOrSignIn,
  missingSignupField,
  type ResearcherSignup,
} from "@/libs/researcherSignup";

type RegisterBody = Partial<ResearcherSignup> & {
  email?: string;
  password?: string;
};

// A researcher signs up: create the account, then add the researcher role
// with the team's sign-up code, and keep the resulting session in cookies,
// so the new researcher is signed in straight away.
async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RegisterBody;
    const { email, password } = body;
    if (!email || !password) {
      return NextResponse.json(
        { error: "missing email or password" },
        { status: 400 },
      );
    }
    const missing = missingSignupField(body);
    if (missing) {
      return NextResponse.json(
        { error: `missing ${missing}` },
        { status: 400 },
      );
    }
    const signup = body as ResearcherSignup;

    const account = await createOrSignIn(email.trim(), password);
    const withRole = await addResearcherRole(account.access_token, signup);

    const response = NextResponse.json(
      { message: "registered" },
      { status: 201 },
    );
    setSessionCookies(response, withRole ?? account);
    return response;
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
