import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  backendUrl,
  harvestSummaryMode,
  simpleDateRegex,
  tokenName,
} from "@/core/constants";
import { HttpError } from "@/core/error";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";
import { SummaryDataResponse } from "@/modules/dashboard/dashboardTypes";

async function POST(req: NextRequest) {
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
    const { polygon } = await req.json();
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
    if (!harvestSummaryMode.includes(mode)) {
      throw new HttpError(400, "invalid or missing request parameter");
    }
    const path = polygon
      ? "api/v1/harvest/spartial/summary"
      : "api/v1/harvest/summary";
    const method = polygon ? "POST" : "GET";
    const response = await fetch(
      `${backendUrl}/${path}/${mode}?from=${from}&to=${to}`,
      {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Cookie: `${token!.name}=${token!.value}`,
        },
      },
    );
    if (!response.ok) {
      const { error } = await response.json();
      const setCookie = response.headers.getSetCookie();
      throw new HttpError(
        response.status,
        error ?? response.statusText,
        setCookie,
      );
    }
    const data = (await response.json()) as SummaryDataResponse;
    return NextResponse.json(data, { status: 200 });
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

export { POST };
