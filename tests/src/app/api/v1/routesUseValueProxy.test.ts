import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// A route that forwards the backend's answer with proxyToBackend hands the page
// the hub's bare data (no { value }), which is what broke the dashboard. Routes
// must use proxyValueToBackend. The only routes allowed to use proxyToBackend
// are the ones that read the bare data themselves and build their own answer.
// This fails when someone adds a route and forgets -- the per-route tests above
// only cover the routes that existed when they were written.
const READS_BARE_DATA = new Set([
  "auth/me/route.ts",
  "reset-password/route.ts",
]);

const apiRoot = path.join(process.cwd(), "src/app/api/v1");

function routeFiles(): string[] {
  return (fs.readdirSync(apiRoot, { recursive: true }) as string[])
    .map((p) => p.split(path.sep).join("/"))
    .filter((p) => p.endsWith("/route.ts") || p === "route.ts");
}

describe("API routes", () => {
  it("finds the routes (guards against this test silently checking nothing)", () => {
    expect(routeFiles().length).toBeGreaterThan(20);
  });

  it("forward the backend's answer through proxyValueToBackend, not proxyToBackend", () => {
    const offenders = routeFiles().filter((file) => {
      if (READS_BARE_DATA.has(file)) return false;
      const source = fs.readFileSync(path.join(apiRoot, file), "utf-8");
      // a call, not a mention in a comment
      return /\bproxyToBackend\s*(<[^>]*>)?\s*\(/.test(source);
    });

    expect(offenders).toEqual([]);
  });

  it("keeps the exceptions honest: each one really does call proxyToBackend", () => {
    for (const file of READS_BARE_DATA) {
      const source = fs.readFileSync(path.join(apiRoot, file), "utf-8");
      expect(source, file).toMatch(/\bproxyToBackend\s*(<[^>]*>)?\s*\(/);
    }
  });
});
