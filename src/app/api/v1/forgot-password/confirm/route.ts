export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { backendEndpoints, backendHref } from "@/core/constants";
import { HttpError } from "@/core/error";
import { apiErrorResponse } from "@/libs/apiUtil";
import { readBackendError } from "@/libs/backendSession";

type ConfirmBody = { login?: string; code?: string; newPassword?: string };

// The code and the new password go to the backend, which sets the password and
// signs the account out everywhere. The person signs in again afterwards.
async function POST(req: NextRequest) {
  try {
    const { login, code, newPassword } = (await req.json()) as ConfirmBody;
    if (!login?.trim() || !code?.trim() || !newPassword) {
      return NextResponse.json(
        { error: "missing username, code or new password" },
        { status: 400 },
      );
    }
    const backendResponse = await fetch(
      backendHref(backendEndpoints.auth.forgotPasswordConfirm),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          login: login.trim(),
          code: code.trim(),
          new_password: newPassword,
        }),
      },
    );
    if (!backendResponse.ok) {
      if (backendResponse.status === 400) {
        // The backend's own text is Thai; this page is English.
        throw new HttpError(
          400,
          "The code is wrong or has expired. Request a new one.",
        );
      }
      throw new HttpError(
        backendResponse.status,
        (await readBackendError(backendResponse)) ?? backendResponse.statusText,
      );
    }
    return NextResponse.json({ message: "password reset" }, { status: 200 });
  } catch (e) {
    return apiErrorResponse(e);
  }
}

export { POST };
