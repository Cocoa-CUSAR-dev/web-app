import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { HandlerFieldsResponse } from "@/modules/form/route-form-create/formCreateTypes";

async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handler: string }> },
) {
  try {
    checkTokenPresence(req);
    const { handler } = await params;
    const data = await proxyToBackend<HandlerFieldsResponse>(
      req,
      `/api/v1/forms/handlers/${handler}/fields`,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
