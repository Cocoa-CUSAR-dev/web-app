import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { refreshTokenName } from "@/core/constants";
import { apiErrorResponse, checkTokenPresence } from "@/libs/apiUtil";
import { clearSessionCookies, hubFetch } from "@/libs/session";

// Revokes this browser's refresh token at backend-hub, then drops both
// cookies. The cookies go even if the hub can't be reached: signing out
// locally must always work.
async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const refreshToken = req.cookies.get(refreshTokenName)?.value;
    if (refreshToken) {
      try {
        await hubFetch("/api/v1/auth/logout", {
          method: "POST",
          body: { refresh_token: refreshToken },
        });
      } catch (e) {
        console.error("logout: could not revoke the refresh token", e);
      }
    }
    return clearSessionCookies(
      NextResponse.json(
        { value: "logout successful", error: null },
        { status: 200 },
      ),
    );
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
