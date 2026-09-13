export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl } from "@/core/constants";
import { HttpError } from "@/core/error";
import { LoginRequestType } from "@/core/types";
import { apiErrorResponse } from "@/libs/apiUtil";

async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as LoginRequestType;
    if (!username || !password) {
      return NextResponse.json(
        { error: "missing username or password" },
        { status: 400 },
      );
    }
    const backendResponse = await fetch(`${backendUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    if (!backendResponse.ok) {
      const { error } = await backendResponse.json();
      const setCookie = backendResponse.headers.getSetCookie();
      throw new HttpError(
        backendResponse.status,
        error ?? backendResponse.statusText,
        setCookie,
      );
    }
    const cookiesToSet = backendResponse.headers.getSetCookie();
    const response = NextResponse.json(
      {
        message: "login success",
      },
      {
        status: backendResponse.status,
      },
    );
    cookiesToSet.forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });
    return response;
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
