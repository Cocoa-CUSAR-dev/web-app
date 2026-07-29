import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the COCOA web app.
 *
 * Specs live in `./tests` and hard-code `localhost:3000`. We centralize the
 * base URL here, replace the inline `goto('http://localhost:3000/')` calls in
 * the specs with `page.goto('/')` via `baseURL`, and start the Next.js server
 * automatically during local/CI runs.
 *
 * Override with env vars:
 *   BASE_URL       – reuse an already-running server (skips webServer)
 *   PORT           – port for `next start` (default 3000)
 *   CI             – set by GitHub Actions to disable retries and forbid .only
 */
const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Start `next start` only when BASE_URL isn't already reachable (local + CI
  // when not pointing at a deployed env). `reuseExistingServer` lets devs run
  // `pnpm dev` in another terminal and skip the launcher.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `pnpm exec next start --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: !isCI,
        timeout: 120_000,
        stdout: "pipe",
        stderr: "pipe",
      },
});
