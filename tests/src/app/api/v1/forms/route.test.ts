import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "@/app/api/v1/forms/route";

import { makeApiRequest } from "../../../../testUtils/nextRequest";

describe("GET /api/v1/forms", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(makeApiRequest("/api/v1/forms"));

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns the backend's forms list with 200 on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: [{ id: "1" }] }), { status: 200 }),
    );

    const res = await GET(makeApiRequest("/api/v1/forms", { token: "t" }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ value: [{ id: "1" }] });
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "server error" }), {
        status: 500,
      }),
    );

    const res = await GET(makeApiRequest("/api/v1/forms", { token: "t" }));

    expect(res.status).toBe(500);
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(makeApiRequest("/api/v1/forms", { token: "t" }));

    expect(res.status).toBe(500);
  });
});

// US4-4 (docs-and-plan#237): the create-form page sends `recurrence` and
// `recipients` next to the existing fields. This route forwards the body as
// it is, so these pin that new fields are not dropped on the way.
describe("POST /api/v1/forms", () => {
  const section = {
    title: "Main",
    description: null,
    sortOrder: 0,
    questions: [
      {
        label: "Note",
        description: null,
        inputType: "VARCHAR",
        fieldName: "note",
        isMandatory: false,
        sortOrder: 0,
      },
    ],
  };
  const base = {
    title: "Daily check",
    description: null,
    openAt: "2026-10-05T08:00",
    closeAt: "2026-10-05T17:00",
    handler: "farm_activity",
    isMultipleSubmit: false,
    sections: [section],
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("forwards the repeat rule and the recipients to the backend untouched", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { formId: "f1" } }), {
        status: 201,
      }),
    );
    const body = {
      ...base,
      recurrence: {
        frequency: "WEEKLY",
        weekdays: [1, 4],
        untilDate: "2026-12-31",
      },
      recipients: [
        { type: "ROLE", id: "role-1" },
        { type: "USER", id: "user-1" },
      ],
    };

    const res = await POST(
      makeApiRequest("/api/v1/forms", { method: "POST", body, token: "t" }),
    );

    expect(res.status).toBe(201);
    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/forms",
      expect.objectContaining({ method: "POST", body: JSON.stringify(body) }),
    );
  });

  it("still forwards a one-off task that has neither", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ value: { formId: "f1" } }), {
        status: 201,
      }),
    );

    await POST(
      makeApiRequest("/api/v1/forms", {
        method: "POST",
        body: base,
        token: "t",
      }),
    );

    const sent = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(sent).not.toHaveProperty("recurrence");
    expect(sent).not.toHaveProperty("recipients");
  });

  it("passes the backend's reason through when it refuses the request", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "The chosen recipients do not match any user",
        }),
        { status: 400 },
      ),
    );

    const res = await POST(
      makeApiRequest("/api/v1/forms", {
        method: "POST",
        body: { ...base, recipients: [{ type: "ROLE", id: "empty-role" }] },
        token: "t",
      }),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "The chosen recipients do not match any user",
    });
  });
});
