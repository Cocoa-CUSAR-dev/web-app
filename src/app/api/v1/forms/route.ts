import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import {
  CreateFormRequest,
  CreateFormResponse,
} from "@/modules/form/route-form-create/formCreateTypes";
import { GetFormsResponse } from "@/modules/form/route-form-edit/formEditTypes";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const data = await proxyToBackend<GetFormsResponse>(
      req,
      backendEndpoints.forms.list,
      {
        method: "GET",
      },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

async function POST(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const body = (await req.json()) as CreateFormRequest;
    if (!body.title || !body.handler || !body.sections?.length) {
      return NextResponse.json(
        {
          error: "missing title, handler, or sections",
        },
        {
          status: 400,
        },
      );
    }
    const data = await proxyToBackend<CreateFormResponse>(
      req,
      backendEndpoints.forms.list,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    );
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET, POST };
