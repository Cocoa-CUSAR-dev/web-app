import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { apiErrorResponse, checkTokenPresence, proxyToBackend } from "@/libs/apiUtil";

async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const { taskId } = await params;
    checkTokenPresence(req);
    const data = await proxyToBackend(
      req,
      `/api/v1/tasks/${taskId}/responses`,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
