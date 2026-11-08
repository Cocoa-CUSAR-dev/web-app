// #region global
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl && typeof window === "undefined") {
  throw new Error(
    "BACKEND_URL environment variable is not set. Set it before starting the app (see .env.sample).",
  );
}
const tokenName = process.env.TOKEN_NAME ?? "token";
// Cookie holding the refresh token (see src/libs/backendSession.ts).
const refreshTokenName = process.env.REFRESH_TOKEN_NAME ?? "refresh_token";
// How long the browser keeps the refresh cookie: the backend's
// REFRESH_TOKEN_TTL_DAYS (90).
const refreshCookieMaxAgeSeconds = 90 * 24 * 60 * 60;
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
  refreshCookieMaxAgeSeconds,
  refreshTokenName,
  simpleDateRegex,
  tokenName,
  userSummaryMode,
  userTimeSeriesMode,
};
