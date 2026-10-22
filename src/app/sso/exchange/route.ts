import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { HttpError } from "@/core/error";
import { requestTokenPair, setSessionCookies } from "@/libs/session";

// US3-2 #125 (F2): the SSO token arrives in the URL fragment and is read
// client-side (src/app/sso/page.tsx), then POSTed here -- so it never travels in
// a URL the server or any proxy would log. This handler swaps it at backend-hub
// for a token pair and keeps that in this app's own HttpOnly cookies, the same
// as a password login.
async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    const body = (await req.json()) as { token?: unknown };
    token = typeof body.token === "string" ? body.token : undefined;
  } catch {
    token = undefined;
  }

  if (!token) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const pair = await requestTokenPair("/api/v1/auth/sso/exchange", { token });
    return setSessionCookies(NextResponse.json({ ok: true }), pair);
  } catch (e) {
    // Refused (expired, already used, forged) -> 401; hub unreachable -> 502.
    return NextResponse.json(
      { ok: false },
      { status: e instanceof HttpError ? 401 : 502 },
    );
  }
}

export { POST };
