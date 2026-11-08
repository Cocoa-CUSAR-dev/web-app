import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyValueToBackend,
} from "@/libs/apiUtil";

async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ formId: string }> },
) {
  try {
    const { formId } = await params;
    checkTokenPresence(req);
    const data = await proxyValueToBackend(
      req,
      backendEndpoints.forms.responses(formId),
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
