import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { harvestTimeSeriesMode, simpleDateRegex } from "@/core/constants";
import { HttpError } from "@/core/error";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { TimeSeriesDataResponse } from "@/modules/dashboard/dashboardTypes";

async function POST(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const {
      nextUrl: { searchParams },
    } = req;
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
    const body =
      method !== "GET"
        ? JSON.stringify({ geoJson: JSON.stringify(polygon) })
        : undefined;

    const data = await proxyToBackend<TimeSeriesDataResponse>(
      req,
      `/${path}/${mode}?from=${from}&to=${to}`,
      { method, body },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
