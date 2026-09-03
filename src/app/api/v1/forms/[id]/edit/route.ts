import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
    const data = await proxyToBackend(req, `/api/v1/forms/${id}/edit`, {
      method: "PUT",
      body: JSON.stringify({ sections }),
    });
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { PUT };
