import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";
import { RoleOptionsResponse } from "@/modules/form/reminder/reminderTypes";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const data = await proxyToBackend<RoleOptionsResponse>(
      req,
      "/api/v1/reminders/recipient-options/roles",
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
