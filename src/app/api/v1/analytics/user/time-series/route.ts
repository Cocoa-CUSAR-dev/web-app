import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  backendUrl,
  simpleDateRegex,
  tokenName,
  userTimeSeriesMode,
} from "@/core/constants";
import { HttpError } from "@/core/error";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const {
      cookies,
      nextUrl: { searchParams },
    } = req;
    const token = cookies.get(tokenName);
    const mode = searchParams.get("mode");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!mode) {
      throw new HttpError(400, "missing data mode");
    }
    if (
      !from ||
      !to ||
      !simpleDateRegex.test(from) ||
      !simpleDateRegex.test(to)
    ) {
      throw new HttpError(400, "invalid or missing request parameter");
    }
    if (!userTimeSeriesMode.includes(mode)) {
      throw new HttpError(400, "invalid data mode");
    }
    const response = await fetch(
      `${backendUrl}/api/v1/analytics/users/time-series/${mode}?from=${from}&to=${to}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${token!.name}=${token!.value}`,
        },
      },
    );
    if (!response.ok) {
      const { error } = await response.json();
      const setCookies = response.headers.getSetCookie();
      throw new HttpError(
        response.status,
        error ?? response.statusText,
        setCookies,
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

export { GET };
