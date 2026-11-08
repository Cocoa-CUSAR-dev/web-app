import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyValueToBackend,
} from "@/libs/apiUtil";
import { SubmissionDaysResponse } from "@/modules/history/historyTypes";

// Only these query params are forwarded, so the browser can't tack
// arbitrary parameters onto the backend call.
const FORWARDED_PARAMS = ["page", "size"] as const;

// US2-6/US5-1 (docs-and-plan#130, #134, #230): list of days the authenticated
// farmer has at least one submission on, newest first. Paged (BE-9) so the
// page can load more days on demand instead of all of them at once.
async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);

    const query = new URLSearchParams();
    FORWARDED_PARAMS.forEach((name) => {
      const value = req.nextUrl.searchParams.get(name);
      if (value !== null) query.set(name, value);
    });
    const suffix = query.size > 0 ? `?${query.toString()}` : "";

    const data = await proxyValueToBackend<SubmissionDaysResponse>(
      req,
      backendEndpoints.me.history(suffix),
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
