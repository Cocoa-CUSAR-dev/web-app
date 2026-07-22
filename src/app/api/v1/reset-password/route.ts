import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { AuthResetPasswordReqType } from "@/core/types";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";

async function PATCH(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const { cookies } = req;
    const token = cookies.get(tokenName);
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
    const response = await fetch(`${backendUrl}/api/v1/auth/reset-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${token!.name}=${token!.value}`,
      },
      body: JSON.stringify({
        newPassword,
      }),
    });
    if (!response.ok) {
      const { error } = await response.json();
      const setCookie = response.headers.getSetCookie();
      throw new HttpError(
        response.status,
        error ?? response.statusText,
        setCookie,
      );
    }
    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (e) {
    handleApiError(e);
    if (e instanceof HttpError) {
      const res = NextResponse.json(
        {
          error: e.message,
        },
        {
          status: e.status,
        },
      );
      if (e.setCookies && e.setCookies.length > 0) {
        e.setCookies.forEach((cookieString) => {
          res.headers.append("Set-Cookie", cookieString);
        });
      }
      return res;
    }
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

export { PATCH };
