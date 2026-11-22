export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints } from "@/core/constants";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyValueToBackend,
} from "@/libs/apiUtil";

// An admin resets the password of someone who has neither email nor LINE. The
// backend answers with a temporary password, shown once; the person must pick
// their own at their next sign-in.
async function POST(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const { login } = (await req.json()) as { login?: string };
    if (!login?.trim()) {
      return NextResponse.json(
        { error: "missing username, phone number or email" },
        { status: 400 },
      );
    }
    const data = await proxyValueToBackend(
      req,
      backendEndpoints.admin.passwordResets,
      { method: "POST", body: JSON.stringify({ login: login.trim() }) },
    );
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
