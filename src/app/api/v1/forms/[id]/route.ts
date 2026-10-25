import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import { HttpError } from "@/core/error";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyValueToBackend,
} from "@/libs/apiUtil";
import {
  UpdateFormRequest,
  UpdateFormResponse,
} from "@/modules/form/route-form-create/formCreateTypes";
import { GetFormIdResponse } from "@/modules/form/route-form-edit/formEditTypes";

async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkTokenPresence(req);
    const { id } = await params;
    const data = await proxyValueToBackend<GetFormIdResponse>(
      req,
      backendEndpoints.forms.byId(id),
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkTokenPresence(req);
    const { id } = await params;
    const body = (await req.json()) as UpdateFormRequest;
    if (!body.sections?.length) {
      throw new HttpError(400, "missing form section body");
    }
    const data = await proxyValueToBackend<UpdateFormResponse>(
      req,
      backendEndpoints.forms.byId(id),
      { method: "PUT", body: JSON.stringify(body) },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET, PUT };
