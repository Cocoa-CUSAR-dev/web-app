import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { tokenName } from "@/core/constants";
import { AuthResetPasswordReqType } from "@/core/types";
import { apiErrorResponse, checkTokenPresence } from "@/libs/apiUtil";
import { requestTokenPair, setSessionCookies } from "@/libs/session";

// backend-hub changes the password, signs out every other device and hands
// this one a fresh token pair, so the user stays signed in here.
async function PATCH(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const { newPassword } = (await req.json()) as AuthResetPasswordReqType;
    if (!newPassword) {
      return NextResponse.json(
        {
          error: "missing new password",
        },
        {
          status: 400,
        },
      );
    }
    const pair = await requestTokenPair(
      "/api/v1/auth/reset-password",
      { new_password: newPassword },
      req.cookies.get(tokenName)?.value,
      "PATCH",
    );
    return setSessionCookies(
      NextResponse.json(
        { value: "password changed", error: null },
        { status: 200 },
      ),
      pair,
    );
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { PATCH };
