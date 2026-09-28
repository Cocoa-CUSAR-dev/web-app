import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { SubmissionDaysResponse } from "@/modules/history/historyTypes";

// US2-6/US5-1 (docs-and-plan#130, #134): list of days the authenticated
// farmer has at least one submission on, newest first.
async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const data = await proxyToBackend<SubmissionDaysResponse>(
      req,
      "/api/v1/me/history",
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
