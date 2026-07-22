import "server-only";

import type { NextRequest } from "next/server";

import { tokenName } from "@/core/constants";
import { HttpError } from "@/core/error";

function checkTokenPresence(req: NextRequest) {
  const token = req.cookies.get(tokenName);
  if (!token || !token.name || !token.value) {
    throw new HttpError(401, "missing authentication token");
  }
}

function handleApiError(e: unknown) {
  if (e instanceof HttpError) {
    console.error(`HTTP ${e.status}: ${e.message}`);
  } else {
    console.error(
      e instanceof Error ? `${e.name}: ${e.message}` : "Unkown Error",
    );
  }
}

export { checkTokenPresence, handleApiError };
