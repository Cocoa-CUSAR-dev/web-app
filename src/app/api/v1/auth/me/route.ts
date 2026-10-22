import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { AuthResponseType } from "@/core/types";
import { apiErrorResponse, proxyToBackend } from "@/libs/apiUtil";

// The signed-in user, or `value: null` for an anonymous visitor -- never a
// 401, because "not logged in" is the normal answer for a public page, not
// an error. Lets the landing page ask from the browser after it has
// rendered, so the page itself can be static (see ClientAuthInfoProvider).
async function GET(req: NextRequest) {
  if (!req.cookies.get(tokenName)?.value) {
    return NextResponse.json({ value: null }, { status: 200 });
  }
  try {
    const data = await proxyToBackend<AuthResponseType>(
      req,
      backendEndpoints.auth.me,
      {
        method: "GET",
      },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      return NextResponse.json({ value: null }, { status: 200 });
    }
    return apiErrorResponse(e);
  }
}

export { GET };
