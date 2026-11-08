import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyValueToBackend,
} from "@/libs/apiUtil";
import { RoleOptionsResponse } from "@/modules/form/reminder/reminderTypes";

async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const data = await proxyValueToBackend<RoleOptionsResponse>(
      req,
      backendEndpoints.forms.reminderRecipientRoles,
      { method: "GET" },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
