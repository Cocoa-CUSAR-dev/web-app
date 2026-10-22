import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  backendEndpoints,
  harvestSummaryMode,
  simpleDateRegex,
} from "@/core/constants";
import { HttpError } from "@/core/error";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { SummaryDataResponse } from "@/modules/dashboard/dashboardTypes";

async function POST(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const {
      nextUrl: { searchParams },
    } = req;
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
    const method = polygon ? "POST" : "GET";
    const data = await proxyToBackend<SummaryDataResponse>(
      req,
      backendEndpoints.harvest.summary(Boolean(polygon), mode, from, to),
      { method },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
