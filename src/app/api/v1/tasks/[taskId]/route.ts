import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { TaskIdResponse } from "@/modules/form/route-form-viewer/route-id/formViewerIdTypes";

async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    checkTokenPresence(req);
    const data = await proxyToBackend<TaskIdResponse>(
      req,
      backendEndpoints.tasks.byId(taskId),
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
