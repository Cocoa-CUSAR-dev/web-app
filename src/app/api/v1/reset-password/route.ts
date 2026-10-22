import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import { AuthResetPasswordReqType } from "@/core/types";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { setSessionCookies, type TokenPair } from "@/libs/backendSession";

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
    // Changing the password signs out every other device, so the backend
    // answers with a new token pair for this one.
    const pair = await proxyToBackend<TokenPair>(
      req,
      backendEndpoints.auth.resetPassword,
      {
        method: "PATCH",
        body: JSON.stringify({ new_password: newPassword }),
      },
    );
    const response = NextResponse.json(
      { message: "password changed" },
      { status: 200 },
    );
    setSessionCookies(response, pair);
    return response;
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { PATCH };
