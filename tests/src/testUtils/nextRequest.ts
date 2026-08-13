import { NextRequest } from "next/server";

import { tokenName } from "@/core/constants";

/** Builds a NextRequest for API route handler tests, optionally pre-authenticated. */
function makeApiRequest(
  url: string,
  {
    method = "GET",
    body,
    token,
  }: { method?: string; body?: unknown; token?: string } = {},
) {
  const req = new NextRequest(new URL(url, "http://localhost"), {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (token) {
    req.cookies.set(tokenName, token);
  }
  return req;
}

export { makeApiRequest };
