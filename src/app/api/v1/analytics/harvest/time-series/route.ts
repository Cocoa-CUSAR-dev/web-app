import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  backendUrl,
  harvestTimeSeriesMode,
  simpleDateRegex,
  tokenName,
} from "@/core/constants";
import { HttpError } from "@/core/error";
import { checkTokenPresence, handleApiError } from "@/libs/apiUtil";
import { TimeSeriesDataResponse } from "@/modules/dashboard/dashboardTypes";

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
    let polygon = null;
    try {
      const { polygon: extractedPolygon } = await req.json();
      polygon = extractedPolygon;
    } catch (e) {
      console.log(
        "can't extract polygon:",
        e instanceof Error ? e.message : "",
      );
    }

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
    if (!harvestTimeSeriesMode.includes(mode)) {
      throw new HttpError(400, "invalid data mode");
    }
    const path = polygon
      ? "api/v1/analytics/harvest/spatial/time-series"
      : "api/v1/analytics/harvest/time-series";
    const method = polygon ? "POST" : "GET";
    const fetchOptions: RequestInit = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Cookie: `${token!.name}=${token!.value}`,
      },
    };

    if (method !== "GET") {
      fetchOptions.body = JSON.stringify({ geoJson: JSON.stringify(polygon) });
    }

    const response = await fetch(
      `${backendUrl}/${path}/${mode}?from=${from}&to=${to}`,
      fetchOptions,
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
    const data = (await response.json()) as TimeSeriesDataResponse;
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
