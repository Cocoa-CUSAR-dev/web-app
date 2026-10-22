import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import { HttpError } from "@/core/error";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";

async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkTokenPresence(req);
    const { id } = await params;
    const { sections } = await req.json();
    if (!sections) {
      throw new HttpError(400, "missing form section body");
    }
    const data = await proxyToBackend(req, backendEndpoints.forms.edit(id), {
      method: "PUT",
      body: JSON.stringify({ sections }),
    });
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { PUT };
