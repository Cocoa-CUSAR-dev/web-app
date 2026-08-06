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

  it.fails(
    "returns a Response for valid input (currently falls through to undefined - route has no success path, see BUG note in test.md)",
    async () => {
      // The handler validates email/password but never calls the backend or
      // returns a NextResponse when both are present - it just falls off the
      // end of the function. Next.js would raise "No response is returned"
      // for a real request. This only asserts the minimal contract every
      // route handler must satisfy (return a Response); it doesn't guess at
      // what the actual registration success response should look like,
      // since that's unspecified business logic, not just a bug.
      const res = await POST(
        makeApiRequest("/api/v1/register", {
          method: "POST",
          body: { email: "a@test.com", password: "pw" },
        }),
      );

      expect(res).toBeInstanceOf(Response);
    },
  );
});
