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
  ReminderDetailResponse,
  ReminderRequest,
} from "@/modules/form/reminder/reminderTypes";

async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    checkTokenPresence(req);
    const { id } = await params;
    const data = await proxyValueToBackend<ReminderDetailResponse>(
      req,
      backendEndpoints.forms.reminder(id),
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
    const body = (await req.json()) as ReminderRequest;
    if (typeof body.enabled !== "boolean" || !body.timeOfDay) {
      throw new HttpError(400, "missing enabled or timeOfDay");
    }
    const data = await proxyValueToBackend<ReminderDetailResponse>(
      req,
      backendEndpoints.forms.reminder(id),
      { method: "PUT", body: JSON.stringify(body) },
    );
    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET, PUT };
