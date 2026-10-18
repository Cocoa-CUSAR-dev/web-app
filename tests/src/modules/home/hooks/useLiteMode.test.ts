import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useLiteMode } from "@/modules/home/hooks/useLiteMode";

// Feeds requestAnimationFrame a fixed frame time, so the probe sees a fast or
// a slow machine on demand.
function frameTime(ms: number) {
  let now = 0;
  vi.stubGlobal(
    "requestAnimationFrame",
    (callback: FrameRequestCallback) =>
      setTimeout(() => {
        now += ms;
        callback(now);
      }, 0) as unknown as number,
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
}

function setUrl(search: string) {
  window.history.replaceState(null, "", `/${search}`);
}

describe("useLiteMode", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    setUrl("");
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      })),
    );
    Object.defineProperty(navigator, "hardwareConcurrency", {
      value: 8,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts in full mode, so the prerendered page and hydration agree", () => {
    frameTime(16);
    const { result } = renderHook(() => useLiteMode());
    expect(result.current).toBe(false);
  });

  it("switches to lite on a machine that can't hold ~42fps", async () => {
    frameTime(40);
    const { result } = renderHook(() => useLiteMode());
    await waitFor(() => expect(result.current).toBe(true));
    expect(window.sessionStorage.getItem("home-lite-mode")).toBe("1");
  });

  it("stays full on a fast machine and remembers that", async () => {
    frameTime(16);
    const { result } = renderHook(() => useLiteMode());
    await waitFor(() =>
      expect(window.sessionStorage.getItem("home-lite-mode")).toBe("0"),
    );
    expect(result.current).toBe(false);
  });

  it("goes lite straight away on a 4-core machine, without probing", async () => {
    Object.defineProperty(navigator, "hardwareConcurrency", {
      value: 4,
      configurable: true,
    });
    const raf = vi.fn();
    vi.stubGlobal("requestAnimationFrame", raf);
    const { result } = renderHook(() => useLiteMode());
    await waitFor(() => expect(result.current).toBe(true));
    expect(raf).not.toHaveBeenCalled();
  });

  it("goes lite under prefers-reduced-motion", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
      })),
    );
    const { result } = renderHook(() => useLiteMode());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it("uses the decision already made this session", async () => {
    window.sessionStorage.setItem("home-lite-mode", "1");
    const raf = vi.fn();
    vi.stubGlobal("requestAnimationFrame", raf);
    const { result } = renderHook(() => useLiteMode());
    await waitFor(() => expect(result.current).toBe(true));
    expect(raf).not.toHaveBeenCalled();
  });

  it("?lite=1 and ?lite=0 override everything", async () => {
    window.sessionStorage.setItem("home-lite-mode", "0");
    setUrl("?lite=1");
    const forcedOn = renderHook(() => useLiteMode());
    await waitFor(() => expect(forcedOn.result.current).toBe(true));

    Object.defineProperty(navigator, "hardwareConcurrency", {
      value: 2,
      configurable: true,
    });
    setUrl("?lite=0");
    const forcedOff = renderHook(() => useLiteMode());
    await new Promise((r) => setTimeout(r, 20));
    expect(forcedOff.result.current).toBe(false);
  });

  it("doesn't judge the machine from a throttled background tab", async () => {
    frameTime(1000);
    renderHook(() => useLiteMode());
    await new Promise((r) => setTimeout(r, 50));
    expect(window.sessionStorage.getItem("home-lite-mode")).toBeNull();
  });
});
