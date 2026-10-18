"use client";

import { useEffect, useState } from "react";

// Lite mode for machines that can't keep up with the full landing page: on a
// weak GPU the stack of composited scene layers outran its raster budget and
// tiles came up blank or blurred mid-scroll (copy cards cut off, half a hill
// missing). Lite drops what multiplies GPU layers -- per-layer parallax and
// will-change, ambient motion, falling leaves, paper grain -- and keeps the
// scenes, the copy and the crossfade between chapters.
//
// Decided once per tab (sessionStorage), from the device hints browsers give
// plus a short frame-rate probe right after the page loads. `?lite=1` /
// `?lite=0` forces it either way, for testing.

const STORAGE_KEY = "home-lite-mode";
// Probe frames, and the median frame time above which a machine is "slow":
// 24ms ~= 42fps with nothing scrolling yet, already short of a smooth scroll.
const PROBE_FRAMES = 45;
const SLOW_FRAME_MS = 24;

function forcedByUrl(): boolean | null {
  const value = new URLSearchParams(window.location.search).get("lite");
  if (value === "1") return true;
  if (value === "0") return false;
  return null;
}

function remembered(): boolean | null {
  try {
    const value = window.sessionStorage.getItem(STORAGE_KEY);
    return value === null ? null : value === "1";
  } catch {
    return null;
  }
}

function remember(lite: boolean) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, lite ? "1" : "0");
  } catch {
    // Private mode / blocked storage: the probe simply runs again next load.
  }
}

// Hints that already settle it, before any probe.
function weakByHints(): boolean {
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    nav.connection?.saveData === true ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4)
  );
}

function useLiteMode(): boolean {
  // Full mode on the server and on the first client render, so the
  // prerendered page and hydration agree; the decision lands right after.
  const [lite, setLite] = useState(false);

  useEffect(() => {
    const decided = forcedByUrl() ?? remembered();
    if (decided !== null) {
      setLite(decided);
      return;
    }
    if (weakByHints()) {
      remember(true);
      setLite(true);
      return;
    }

    let frame = 0;
    let last = 0;
    let times: number[] = [];
    const sample = (now: number) => {
      if (last) times.push(now - last);
      last = now;
      if (times.length < PROBE_FRAMES) {
        frame = requestAnimationFrame(sample);
        return;
      }
      // The first frames include hydration and image decode; skip them.
      const settled = times.slice(10).sort((a, b) => a - b);
      // A background tab is throttled to ~1 frame a second, which says
      // nothing about the machine; start over instead of deciding.
      if (settled[settled.length - 1] > 250) {
        times = [];
        last = 0;
        frame = requestAnimationFrame(sample);
        return;
      }
      const median = settled[Math.floor(settled.length / 2)];
      const slow = median > SLOW_FRAME_MS;
      remember(slow);
      if (slow) setLite(true);
    };
    const start = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", start);
      frame = requestAnimationFrame(sample);
    };
    document.addEventListener("visibilitychange", start);
    start();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  return lite;
}

export { useLiteMode };
