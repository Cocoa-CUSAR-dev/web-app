import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTimeSeriesChart } from "@/modules/dashboard/hooks/useTimeSeriesChart";

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: async () => body,
  };
}

describe("useTimeSeriesChart", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("GET request: sets title/data from a successful response", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, {
        value: {
          title: "Users in 2024",
          series: [{ label: "Total", values: [1, 2, 3] }],
        },
      }) as Response,
    );

    const { result } = renderHook(() =>
      useTimeSeriesChart("/api/v1/analytics/user/time-series", "delta"),
    );

    await act(async () => {
      await result.current.onLoadData(1, 2024, 12, 2024);
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/analytics/user/time-series?mode=delta&from=2024-01&to=2024-12",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result.current.title).toBe("Users in 2024");
    expect(result.current.data).toEqual([
      { label: "Total", data: [1, 2, 3], backgroundColor: expect.any(String) },
    ]);
  });

  it("POST request: sends the body thunk's latest value", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(200, {
        value: { title: "Harvest in 2024", series: [] },
      }) as Response,
    );
    const polygon = { type: "Polygon", coordinates: [] };

    const { result } = renderHook(() =>
      useTimeSeriesChart("/api/v1/analytics/harvest/time-series", "sum", {
        method: "POST",
        body: () => ({ polygon }),
      }),
    );

    await act(async () => {
      await result.current.onLoadData(1, 2024, 12, 2024);
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ polygon }),
      }),
    );
  });

  it("distinguishes a cancelled (AbortError) request from a real failure", async () => {
    // fetchResponse() itself logs via console.error before rethrowing --
    // this test is about the hook's OWN catch block, which console.logs
    // real failures but must swallow an AbortError silently (it's an
    // expected outcome of cancellation, not a bug to report).
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() =>
      useTimeSeriesChart("/api/v1/analytics/user/time-series", "delta"),
    );

    vi.mocked(fetch).mockRejectedValueOnce(
      new DOMException("aborted", "AbortError"),
    );
    await act(async () => {
      await result.current.onLoadData(1, 2024, 12, 2024);
    });
    expect(logSpy).not.toHaveBeenCalled();

    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));
    await act(async () => {
      await result.current.onLoadData(1, 2024, 12, 2024);
    });
    expect(logSpy).toHaveBeenCalled();
  });
});
