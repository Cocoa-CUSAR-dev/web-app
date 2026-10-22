export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { LoginRequestType } from "@/core/types";
import { apiErrorResponse } from "@/libs/apiUtil";
import { requestTokenPair, setSessionCookies } from "@/libs/session";

// backend-hub answers with the token pair in the body; we keep it in this
// app's own HttpOnly cookies so browser JavaScript never sees it.
async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as LoginRequestType;
    if (!username || !password) {
      return NextResponse.json(
        { error: "missing username or password" },
        { status: 400 },
      );
    }
    const pair = await requestTokenPair("/api/v1/auth/login", {
      username,
      password,
    });
    return setSessionCookies(
      NextResponse.json(
        {
          message: "login success",
          mustResetPassword: pair.user.must_reset_password,
        },
        { status: 200 },
      ),
      pair,
    );
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
