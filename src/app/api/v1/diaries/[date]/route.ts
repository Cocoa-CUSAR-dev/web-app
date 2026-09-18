import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { DiaryResponse } from "@/modules/history/historyTypes";

// US2-6 (docs-and-plan#130, #132, #134): the stored diary for `date`, if
// one was generated. 404s straight through when there isn't one (a date
// before this feature existed, or a day with no submissions) --
// HistoryModule falls back to /api/v1/history/[date] on that.
async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ date: string }> },
) {
  try {
    const { date } = await params;
    checkTokenPresence(req);
    const data = await proxyToBackend<DiaryResponse>(
      req,
      `/api/v1/me/diaries/${date}`,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
