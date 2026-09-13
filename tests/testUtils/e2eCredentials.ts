// FE-8: was hardcoded 'admin'/'Password123!' repeated in every spec file.
// The mock backend (tests/mocks/backend-server.mjs) used for local/CI runs
// doesn't actually check credentials, so these defaults keep every existing
// run working unchanged -- override via env when running against a real
// backend where they matter.
const E2E_USERNAME = process.env.E2E_TEST_USERNAME ?? "admin";
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "Password123!";

export { E2E_PASSWORD, E2E_USERNAME };
