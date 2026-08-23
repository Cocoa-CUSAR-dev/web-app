import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { simpleDateRegex, userTimeSeriesMode } from "@/core/constants";
import { HttpError } from "@/core/error";
import { apiErrorResponse, checkTokenPresence, proxyToBackend } from "@/libs/apiUtil";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const {
      nextUrl: { searchParams },
    } = req;
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
    const data = await proxyToBackend(
      req,
      `/api/v1/analytics/users/time-series/${mode}?from=${from}&to=${to}`,
      { method: "GET" },
    );
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
