import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl } from "@/core/constants";

// US3-2 #125 (F2): the SSO token now arrives in the URL fragment and is read
// client-side (src/app/sso/page.tsx), then POSTed here -- so it never travels in
// a URL the server or any proxy would log. This handler swaps it for the real
// session cookie (same job the old GET /sso did) and forwards Set-Cookie back to
// the browser; being same-origin, the cookie is stored for the web app.
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
    const backendResponse = await fetch(
      `${backendUrl}/api/v1/auth/sso/exchange`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      },
    );

    if (!backendResponse.ok) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    backendResponse.headers.getSetCookie().forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });
    return response;
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}

export { POST };
