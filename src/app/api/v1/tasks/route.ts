import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyValueToBackend,
} from "@/libs/apiUtil";
import { TasksResponse } from "@/modules/form/route-form-viewer/route-id/formViewerIdTypes";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const data = await proxyValueToBackend<TasksResponse>(
      req,
      backendEndpoints.forms.listWithStats,
      {
        method: "GET",
      },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
