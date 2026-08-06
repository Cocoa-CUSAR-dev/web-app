import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HttpError } from "@/core/error";
import { fetchResponse } from "@/libs/fetchResponse";

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("fetchResponse", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("calls fetch with the given path, method, and default JSON headers", async () => {
    const mockResponse = jsonResponse({ ok: true });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    await fetchResponse("/api/v1/tasks", { method: "GET" });

    expect(fetch).toHaveBeenCalledWith("/api/v1/tasks", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: undefined,
    });
  });

  it("uses custom headers when provided instead of the default", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}));

    await fetchResponse("/api/v1/tasks", {
      method: "GET",
      headers: { Authorization: "Bearer token" },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks",
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      }),
    );
  });

  it("forwards the body for POST requests", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}));

    await fetchResponse("/api/v1/login", {
      method: "POST",
      body: JSON.stringify({ username: "a" }),
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/login",
      expect.objectContaining({ body: JSON.stringify({ username: "a" }) }),
    );
  });

  it("appends the encoded query string directly to the path (no `?` separator)", async () => {
    // encodeQueryParams returns URLSearchParams#toString() with no leading
    // "?", and fetchResponse concatenates it as-is onto `path`.
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}));

    await fetchResponse("/api/v1/tasks", {
      method: "GET",
      queryParams: { from: "2024-01", to: "2024-02", missing: undefined },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasksfrom=2024-01&to=2024-02",
      expect.anything(),
    );
  });

  it("returns the response when the request succeeds", async () => {
    const mockResponse = jsonResponse({ ok: true });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const result = await fetchResponse("/api/v1/tasks", { method: "GET" });

    expect(result).toBe(mockResponse);
  });

  it("throws an HttpError for a failing response whose status is within array bounds of httpValidStatuses", async () => {
    // httpValidStatuses is an array of status codes checked with the `in`
    // operator, which tests array *indices* (0..N-1), not values. Status 404
    // happens to be < httpValidStatuses.length (~500), so it takes the
    // HttpError branch even though 404 isn't literally at that index.
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 404, statusText: "Not Found" }),
    );

    await expect(
      fetchResponse("/api/v1/tasks", { method: "GET" }),
    ).rejects.toThrow(HttpError);
  });

  it("throws a plain Error for a failing response whose status is outside array bounds", async () => {
    // httpValidStatuses has 500 entries (indices 0..499), so status 550 as
    // an index is out of bounds even though it's a "valid" HTTP status.
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 550, statusText: "Weird Status" }),
    );

    await expect(
      fetchResponse("/api/v1/tasks", { method: "GET" }),
    ).rejects.toThrow("Error: 550, Weird Status");
  });

  it("propagates network errors thrown by fetch", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(
      fetchResponse("/api/v1/tasks", { method: "GET" }),
    ).rejects.toThrow("network down");
  });
});
