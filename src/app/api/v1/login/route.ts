export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints, backendHref } from "@/core/constants";
import { HttpError } from "@/core/error";
import { LoginRequestType } from "@/core/types";
import { apiErrorResponse } from "@/libs/apiUtil";
import {
  readBackendError,
  setSessionCookies,
  type TokenPair,
} from "@/libs/backendSession";

async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as LoginRequestType;
    if (!username || !password) {
      return NextResponse.json(
        { error: "missing username or password" },
        { status: 400 },
      );
    }
    const backendResponse = await fetch(
      backendHref(backendEndpoints.auth.login),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      },
    );
    if (!backendResponse.ok) {
      throw new HttpError(
        backendResponse.status,
        (await readBackendError(backendResponse)) ?? backendResponse.statusText,
      );
    }
    const pair = (await backendResponse.json()) as TokenPair;
    const response = NextResponse.json(
      {
        message: "login success",
      },
      {
        status: backendResponse.status,
      },
    );
    setSessionCookies(response, pair);
    return response;
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
