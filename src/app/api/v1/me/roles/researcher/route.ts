export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { apiErrorResponse } from "@/libs/apiUtil";
import { setSessionCookies } from "@/libs/backendSession";
import {
  addResearcherRole,
  missingSignupField,
  type ResearcherSignup,
} from "@/libs/researcherSignup";

// Someone already signed in (a farmer who uses the web for their history)
// becomes a researcher too, with the team's sign-up code. The backend
// answers with a new token pair holding the role; it replaces the session
// cookies so the researcher pages open on the next navigation.
async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(tokenName)?.value;
    if (!accessToken) {
      throw new HttpError(401, "missing authentication token");
    }
    const body = (await req.json()) as Partial<ResearcherSignup>;
    const missing = missingSignupField(body);
    if (missing) {
      return NextResponse.json(
        { error: `missing ${missing}` },
        { status: 400 },
      );
    }

    const pair = await addResearcherRole(accessToken, body as ResearcherSignup);
    const response = NextResponse.json(
      { message: pair ? "researcher role added" : "already a researcher" },
      { status: pair ? 201 : 200 },
    );
    if (pair) setSessionCookies(response, pair);
    return response;
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
