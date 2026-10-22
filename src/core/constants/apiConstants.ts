// #region global
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl && typeof window === "undefined") {
  throw new Error(
    "BACKEND_URL environment variable is not set. Set it before starting the app (see .env.sample).",
  );
}
// backend-hub: login, sessions and /me (CONVENTIONS.md §5 in that repo).
// The rest of the API still goes to BACKEND_URL until it moves to the hub.
const hubUrl = process.env.HUB_URL;
if (!hubUrl && typeof window === "undefined") {
  throw new Error(
    "HUB_URL environment variable is not set. Set it before starting the app (see .env.sample).",
  );
}
const tokenName = process.env.TOKEN_NAME ?? "token";
// The hub's refresh token, kept next to the access token in our own
// HttpOnly cookies -- the browser never sees either value in JavaScript.
const refreshTokenName = `${tokenName}_refresh`;
const simpleDateRegex = /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12][0-9]|3[01]))?$/;

// #region monthly data
const harvestTimeSeriesMode = ["delta", "sum", "average", "frequency"];
const userTimeSeriesMode = ["delta", "sum"];

// #region summary data
const harvestSummaryMode = ["total", "count"];
const userSummaryMode = ["count"];

export {
  backendUrl,
  harvestSummaryMode,
  harvestTimeSeriesMode,
  hubUrl,
  refreshTokenName,
  simpleDateRegex,
  tokenName,
  userSummaryMode,
  userTimeSeriesMode,
};
