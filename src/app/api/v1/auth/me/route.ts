import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { apiErrorResponse } from "@/libs/apiUtil";
import { fetchMe } from "@/libs/session";

// The signed-in user, or `value: null` for an anonymous visitor -- never a
// 401, because "not logged in" is the normal answer for a public page, not
// an error. Lets the landing page ask from the browser after it has
// rendered, so the page itself can be static (see ClientAuthInfoProvider).
async function GET(req: NextRequest) {
  const accessToken = req.cookies.get(tokenName)?.value;
  if (!accessToken) {
    return NextResponse.json({ value: null }, { status: 200 });
  }
  try {
    const value = await fetchMe(accessToken);
    return NextResponse.json({ value, error: null }, { status: 200 });
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      return NextResponse.json({ value: null }, { status: 200 });
    }
    return apiErrorResponse(e);
  }
}

export { GET };
