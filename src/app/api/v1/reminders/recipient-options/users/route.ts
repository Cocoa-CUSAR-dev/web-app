import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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
      `/api/v1/reminders/recipient-options/users?q=${encodeURIComponent(q)}`,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
