import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { HttpError } from "@/core/error";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import {
  CorrectFieldRequest,
  CorrectFieldResponse,
} from "@/modules/form/route-form-viewer/route-review/reviewTypes";

// US2-8 (docs-and-plan#172): correct one field of one submission. The
// backend decides whether the value is valid for the question's type (and
// answers 400 with the reason if not); this only refuses a request that
// has no value at all.
async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ taskId: string; responseId: string; fieldName: string }>;
  },
) {
  try {
    const { taskId, responseId, fieldName } = await params;
    checkTokenPresence(req);

    const body = (await req.json()) as Partial<CorrectFieldRequest>;
    if (typeof body.value !== "string" || !body.value.trim()) {
      throw new HttpError(400, "missing value");
    }
    // Rebuilt rather than forwarded as-is: only the two known keys go on.
    const payload: CorrectFieldRequest = {
      value: body.value,
      reason: typeof body.reason === "string" ? body.reason : undefined,
    };

    const data = await proxyToBackend<CorrectFieldResponse>(
      req,
      `/api/v1/tasks/${encodeURIComponent(taskId)}/review/${encodeURIComponent(
        responseId,
      )}/fields/${encodeURIComponent(fieldName)}`,
      { method: "PATCH", body: JSON.stringify(payload) },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { PATCH };
