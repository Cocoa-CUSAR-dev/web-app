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

  it("separates the query string from the path with `?`", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}));

    await fetchResponse("/api/v1/tasks", {
      method: "GET",
      queryParams: { from: "2024-01", to: "2024-02", missing: undefined },
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks?from=2024-01&to=2024-02",
      expect.anything(),
    );
  });

  it("omits the `?` entirely when every query param is missing", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({}));

    await fetchResponse("/api/v1/tasks", {
      method: "GET",
      queryParams: { missing: undefined },
    });

    expect(fetch).toHaveBeenCalledWith("/api/v1/tasks", expect.anything());
  });

  it("returns the response when the request succeeds", async () => {
    const mockResponse = jsonResponse({ ok: true });
    vi.mocked(fetch).mockResolvedValue(mockResponse);

    const result = await fetchResponse("/api/v1/tasks", { method: "GET" });

    expect(result).toBe(mockResponse);
  });

  it("throws an HttpError for a failing response whose status is listed in httpValidStatuses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 404, statusText: "Not Found" }),
    );

    await expect(
      fetchResponse("/api/v1/tasks", { method: "GET" }),
    ).rejects.toThrow(HttpError);
  });

  it("throws an HttpError for status 550, which is a real HTTP status present in httpValidStatuses", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 550, statusText: "Weird Status" }),
    );

    await expect(
      fetchResponse("/api/v1/tasks", { method: "GET" }),
    ).rejects.toThrow(HttpError);
  });

  it("propagates network errors thrown by fetch", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(
      fetchResponse("/api/v1/tasks", { method: "GET" }),
    ).rejects.toThrow("network down");
  });
});
