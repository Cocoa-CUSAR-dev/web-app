import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { HandlerCatalogResponse } from "@/modules/form/formDefinition/handlerCatalogTypes";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const data = await proxyToBackend<HandlerCatalogResponse>(
      req,
      backendEndpoints.forms.handlerCatalog,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
