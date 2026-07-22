import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const token = req.cookies.get(tokenName);
    const backendResponse = await fetch(`${backendUrl}/api/v1/auth/logout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `${token!.name}=${token!.value}`,
      },
    });
    if (!backendResponse.ok) {
      const { error } = await backendResponse.json();
      throw new HttpError(
        backendResponse.status,
        error ?? backendResponse.statusText,
      );
    }
    const setCookie = backendResponse.headers.getSetCookie();
    if (setCookie.length < 1) {
      throw new HttpError(
        backendResponse.status,
        "backend did not send set cookie",
      );
    }
    const response = NextResponse.json(
      {
        value: "logout successful",
        error: null,
      },
      {
        status: 200,
      },
    );
    response.headers.append("Set-Cookie", setCookie[0]);
    return response;
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

export { GET };
