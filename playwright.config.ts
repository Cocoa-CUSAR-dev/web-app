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
 *   PORT           – port for `next start` (default 3100)
 *   CI             – set by GitHub Actions to disable retries and forbid .only
 */
// Deliberately not 3000: `reuseExistingServer` below would otherwise pick up a
// `pnpm dev` left running there, which reads the developer's own `.env` and so
// talks to the real backend instead of the mock — and skips this file's `env`
// block entirely, including the TOKEN_NAME pin below.
const PORT = Number(process.env.PORT ?? 3100);
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

// The session-cookie name has to be the same on both sides of the mock setup:
// the mock issues it (tests/mocks/backend-data.mjs) and proxy.ts reads it to
// decide whether a request is authenticated. They used to agree only by
// accident — both fall back to "token" when TOKEN_NAME is unset, which is the
// case in CI. Locally, `next start` picks up the developer's `.env` (where
// TOKEN_NAME names the *real* backend's cookie), while the mock never reads
// `.env` at all. The result was a login that returned 200 and set a cookie
// proxy.ts then couldn't find, bouncing every authenticated spec back to the
// login page. Pinning it here makes both sides agree regardless of `.env`.
const E2E_TOKEN_NAME = "token";

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
                env: {
                  MOCK_BACKEND_PORT: String(MOCK_BACKEND_PORT),
                  TOKEN_NAME: E2E_TOKEN_NAME,
                },
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
          env: useMockBackend
            ? { BACKEND_URL: MOCK_BACKEND_URL, TOKEN_NAME: E2E_TOKEN_NAME }
            : {},
        },
      ],
});
