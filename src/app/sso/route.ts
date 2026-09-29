export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendUrl } from "@/core/constants";

// req.url reports the Next dev server's own bind address (localhost:3000),
// not the public hostname a farmer's phone actually used to get here --
// confirmed live 2026-09-17 through a Cloudflare quick tunnel, where every
// redirect built from req.url sent the browser to a bare "localhost:3000"
// it can't reach. x-forwarded-host/-proto are what the tunnel (or any
// reverse proxy) actually saw the client request, so redirects must be
// built from those instead of req.url/req.nextUrl.
function redirectTo(req: NextRequest, path: string) {
  const host =
    req.headers.get("x-forwarded-host") ??
    req.headers.get("host") ??
    req.nextUrl.host;
  const proto =
    req.headers.get("x-forwarded-proto") ??
    req.nextUrl.protocol.replace(":", "");
  return NextResponse.redirect(`${proto}://${host}${path}`);
}

// US2-6: lands here from the LINE diary card's "view full history" button.
// `token` is the short-lived SSO token web-backend's /service/sso/tokens
// minted for the chatbot. Exchanging it here (rather than setting it
// directly as the session cookie) gives the farmer a normal full-length
// session instead of one that expires again in two minutes -- see
// SsoService.kt (web-backend) for the token lifecycle.
async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return redirectTo(req, "/auth?page=login");
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
      return redirectTo(req, "/auth?page=login");
    }

    const response = redirectTo(req, "/history");
    backendResponse.headers.getSetCookie().forEach((cookie) => {
      response.headers.append("set-cookie", cookie);
    });
    return response;
  } catch {
    return redirectTo(req, "/auth?page=login");
  }
}

export { GET };
