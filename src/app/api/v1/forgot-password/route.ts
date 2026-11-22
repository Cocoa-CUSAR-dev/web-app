export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints, backendHref } from "@/core/constants";
import { HttpError } from "@/core/error";
import { apiErrorResponse } from "@/libs/apiUtil";
import { readBackendError } from "@/libs/backendSession";

// Someone who forgot their password asks for a code. They are not signed in,
// and the backend answers the same whether or not the account exists, so this
// does too.
async function POST(req: NextRequest) {
  try {
    const { login } = (await req.json()) as { login?: string };
    if (!login?.trim()) {
      return NextResponse.json(
        { error: "missing username or email" },
        { status: 400 },
      );
    }
    const backendResponse = await fetch(
      backendHref(backendEndpoints.auth.forgotPassword),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login: login.trim() }),
      },
    );
    if (!backendResponse.ok) {
      throw new HttpError(
        backendResponse.status,
        (await readBackendError(backendResponse)) ?? backendResponse.statusText,
      );
    }
    return NextResponse.json({ message: "requested" }, { status: 202 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
