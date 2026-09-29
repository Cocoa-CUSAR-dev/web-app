import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { SubmissionAnswersResponse } from "@/modules/history/historyTypes";

// US2-6/US5-1 (docs-and-plan#130, #134): raw answers the farmer submitted
// on `date`, across every task -- the fallback view for a day with no
// diary entry yet (see /api/v1/diaries/[date]).
async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await params;
    checkTokenPresence(req);
    const data = await proxyToBackend<SubmissionAnswersResponse>(
      req,
      `/api/v1/me/history/${date}`,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
