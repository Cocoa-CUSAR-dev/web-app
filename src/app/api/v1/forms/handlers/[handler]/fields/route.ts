import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
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
      backendEndpoints.forms.handlerFields(handler),
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
