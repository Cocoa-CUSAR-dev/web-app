export const dynamic = "force-dynamic";

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints, tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";
import { AdminAddUserReqType } from "@/core/types";
import {
  apiErrorResponse,
  checkTokenPresence,
  proxyToBackend,
} from "@/libs/apiUtil";

async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(tokenName);
    if (!token || !token.value) {
      return NextResponse.json(
        { error: "missing authorization token" },
        { status: 400 },
      );
    }
    const params = req.nextUrl.searchParams;
    const id = params.get("id");
    if (id) {
      // find id
    } else {
      // find all
    }
  } catch (e) {
    if (e instanceof HttpError) {
      console.error(`HTTP ${e.status}: ${e.message}`);
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
  }
}

async function POST(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const { username, password } = (await req.json()) as AdminAddUserReqType;
    if (!username || !password) {
      return NextResponse.json(
        {
          error: "missing username or password",
        },
        {
          status: 400,
        },
      );
    }
    // backend-hub creates a researcher who must change this temporary
    // password at first sign-in (same rule web-backend had).
    const data = await proxyToBackend(req, backendEndpoints.admin.users, {
      method: "POST",
      body: JSON.stringify({
        username,
        temporary_password: password,
        role: "researcher",
      }),
    });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET, POST };
