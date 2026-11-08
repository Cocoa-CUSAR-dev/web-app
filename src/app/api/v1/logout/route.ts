import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  backendEndpoints,
  backendHref,
  refreshTokenName,
} from "@/core/constants";
import { apiErrorResponse, checkTokenPresence } from "@/libs/apiUtil";
import { clearSessionCookies } from "@/libs/backendSession";

// Signing out revokes this browser's refresh token on the backend, then
// forgets both cookies. The cookies go even when the backend call fails
// (it is down, or the refresh token had already expired): the person asked
// to be signed out of this browser, and that part is ours to do.
async function GET(req: NextRequest) {
  try {
    checkTokenPresence(req);
    const refreshToken = req.cookies.get(refreshTokenName)?.value;
    if (refreshToken) {
      try {
        const backendResponse = await fetch(
          backendHref(backendEndpoints.auth.logout),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          },
        );
        if (!backendResponse.ok) {
          console.error(
            `logout: backend answered ${backendResponse.status}, cookies cleared anyway`,
          );
        }
      } catch (e) {
        console.error(
          e instanceof Error
            ? `logout: ${e.name}: ${e.message}, cookies cleared anyway`
            : "logout: unknown error, cookies cleared anyway",
        );
      }
    }
    const response = NextResponse.json(
      {
        value: "logout successful",
        error: null,
      },
      {
        status: 200,
      },
    );
    clearSessionCookies(response);
    return response;
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { GET };
