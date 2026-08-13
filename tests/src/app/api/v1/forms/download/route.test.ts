// @vitest-environment node
//
// This route streams a binary Response body. jsdom's Blob/Response can't
// stream a native fetch Blob ("object.stream is not a function"), so this
// suite runs under plain Node instead of the project-wide jsdom default.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/api/v1/forms/download/route";

import { makeApiRequest } from "../../../../../testUtils/nextRequest";

describe("GET /api/v1/forms/download", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns 401 without calling the backend when there is no token cookie", async () => {
    const res = await GET(makeApiRequest("/api/v1/forms/download"));

    expect(res.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("streams the file with the backend's content headers on success", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(new Blob(["file-bytes"]), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="report.xlsx"',
          "content-length": "10",
        },
      }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/forms/download", { token: "t" }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="report.xlsx"',
    );
    expect(res.headers.get("Content-Length")).toBe("10");
  });

  it("uppercases the sheets query param when forwarding to the backend", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(new Blob([]), { status: 200 }));

    await GET(
      makeApiRequest("/api/v1/forms/download?sheets=harvest", { token: "t" }),
    );

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("?sheets=HARVEST"),
      expect.anything(),
    );
  });

  it("falls back to default headers when the backend omits them", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(new Blob([]), { status: 200 }));

    const res = await GET(
      makeApiRequest("/api/v1/forms/download", { token: "t" }),
    );

    expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="download"',
    );
  });

  it("propagates the backend's error status and message", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ error: "report not found" }), {
        status: 404,
      }),
    );

    const res = await GET(
      makeApiRequest("/api/v1/forms/download", { token: "t" }),
    );

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "report not found" });
  });

  it("returns 500 for an unexpected error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    const res = await GET(
      makeApiRequest("/api/v1/forms/download", { token: "t" }),
    );

    expect(res.status).toBe(500);
  });
});
