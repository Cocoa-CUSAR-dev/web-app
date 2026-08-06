import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "@/app/api/v1/register/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

describe("POST /api/v1/register", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(
      makeApiRequest("/api/v1/register", {
        method: "POST",
        body: { password: "pw" },
      }),
    );

    expect(res?.status).toBe(400);
    expect(await res?.json()).toEqual({ error: "missing email or password" });
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(
      makeApiRequest("/api/v1/register", {
        method: "POST",
        body: { email: "a@test.com" },
      }),
    );

    expect(res?.status).toBe(400);
  });

  it("BUG: returns undefined for valid input instead of a response (route has no success path)", async () => {
    // The handler validates email/password but never calls the backend or
    // returns a NextResponse when both are present - it just falls off the
    // end of the function. This documents the current (broken) behavior;
    // Next.js would raise "No response is returned" for a real request.
    const res = await POST(
      makeApiRequest("/api/v1/register", {
        method: "POST",
        body: { email: "a@test.com", password: "pw" },
      }),
    );

    expect(res).toBeUndefined();
  });
});
