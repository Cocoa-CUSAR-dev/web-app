import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest config for unit-testing logic-bearing files under `src`.
 *
 * Playwright (`playwright.config.ts`, specs in `./tests`) remains the E2E
 * suite. This config only drives unit tests, which live under
 * `./tests/src` mirroring the `src` tree (e.g. `src/libs/apiUtil.ts` ->
 * `tests/src/libs/apiUtil.test.ts`).
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@/", replacement: `${path.resolve(dirname, "./src")}/` },
      // `server-only` unconditionally throws unless bundled with the
      // "react-server" condition (which Next's server build sets). Vitest
      // runs plain Node, so swap in the no-op build Next uses for RSC.
      {
        find: "server-only",
        replacement: path.resolve(
          dirname,
          "node_modules/server-only/empty.js",
        ),
      },
      // See tests/src/testUtils/muiIconsStub.tsx for why this is stubbed.
      {
        find: "@mui/icons-material",
        replacement: path.resolve(
          dirname,
          "tests/src/testUtils/muiIconsStub.tsx",
        ),
      },
    ],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/src/**/*.test.{ts,tsx}"],
    css: false,
    // apiConstants.ts now fails fast when BACKEND_URL is unset (FE-9) --
    // unlike Playwright (see playwright.config.ts's webServer env), Vitest
    // doesn't load .env files or spawn the app with any env of its own, so
    // this needs an explicit dummy value or every test importing
    // src/core/constants (directly or transitively) throws on import.
    env: {
      BACKEND_URL: "http://localhost:3001",
    },
  },
});
