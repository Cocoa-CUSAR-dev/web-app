import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { ReviewResponse } from "@/modules/form/route-form-viewer/route-review/reviewTypes";

// Only these query params are forwarded, so the browser can't tack
// arbitrary parameters onto the backend call.
const FORWARDED_PARAMS = ["aiOnly", "page", "size"] as const;

// US2-8 (docs-and-plan#172): a task's submissions field by field, for the
// researcher's review-and-correct screen.
async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    checkTokenPresence(req);

    const query = new URLSearchParams();
    FORWARDED_PARAMS.forEach((name) => {
      const value = req.nextUrl.searchParams.get(name);
      if (value !== null) query.set(name, value);
    });
    const suffix = query.size > 0 ? `?${query.toString()}` : "";

    const data = await proxyToBackend<ReviewResponse>(
      req,
      `/api/v1/tasks/${encodeURIComponent(taskId)}/review${suffix}`,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
