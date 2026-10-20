import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
      "/api/v1/forms/handlers/catalog",
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
