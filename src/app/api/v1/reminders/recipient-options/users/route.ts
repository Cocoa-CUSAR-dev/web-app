import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { UserOptionsResponse } from "@/modules/form/reminder/reminderTypes";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const q = req.nextUrl.searchParams.get("q") ?? "";
    const data = await proxyToBackend<UserOptionsResponse>(
      req,
      backendEndpoints.forms.reminderRecipientUsers(q),
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
