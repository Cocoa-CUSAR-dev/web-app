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

// แปะไว้ก่อน เดี๋ยวว่ากัน
// The real Kotlin backend isn't available in CI (or for most local runs), so
// spin up a lightweight mock in its place and point the app at it. Only
// applies when we're also the ones starting the Next.js server (BASE_URL
// unset) and the caller hasn't already pointed BACKEND_URL somewhere real.
const MOCK_BACKEND_PORT = Number(process.env.MOCK_BACKEND_PORT ?? 4310);
const MOCK_BACKEND_URL = `http://127.0.0.1:${MOCK_BACKEND_PORT}`;
const useMockBackend = !process.env.BASE_URL && !process.env.BACKEND_URL;

export default defineConfig({
  testDir: "./tests",
  // Vitest unit tests live under `./tests/src/**/*.test.ts(x)`, mirroring
  // `src/`. Without this, Playwright's default file matching also picks up
  // `*.test.ts(x)` and tries to execute those Vitest suites itself.
  testMatch: "*.spec.ts",
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
  // `pnpm dev` in another terminal and skip the launcher. When no real
  // BACKEND_URL is configured, also boot the mock backend (tests/mocks) so
  // the app has something to talk to.
  webServer: process.env.BASE_URL
    ? undefined
    : [
        ...(useMockBackend
          ? [
              {
                command: `node tests/mocks/backend-server.mjs`,
                url: `${MOCK_BACKEND_URL}/health`,
                reuseExistingServer: !isCI,
                timeout: 30_000,
                stdout: "pipe" as const,
                stderr: "pipe" as const,
                env: { MOCK_BACKEND_PORT: String(MOCK_BACKEND_PORT) },
              },
            ]
          : []),
        {
          command: `pnpm exec next start --port ${PORT}`,
          url: BASE_URL,
          reuseExistingServer: !isCI,
          timeout: 120_000,
          stdout: "pipe" as const,
          stderr: "pipe" as const,
          env: useMockBackend ? { BACKEND_URL: MOCK_BACKEND_URL } : {},
        },
      ],
});
