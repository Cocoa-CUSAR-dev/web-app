import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import { AuthResetPasswordReqType } from "@/core/types";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";

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
    const data = await proxyToBackend(
      req,
      backendEndpoints.auth.resetPassword,
      {
        method: "PATCH",
        body: JSON.stringify({ newPassword }),
      },
    );
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { PATCH };
