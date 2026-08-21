// #region global
// No fallback on purpose (FE-9): a silently-defaulted localhost URL means a
// missing env var in a real deployment fails later, deep inside a fetch
// call, instead of loudly at startup where it's actually debuggable.
const backendUrl = process.env.BACKEND_URL;
if (!backendUrl) {
  throw new Error(
    "BACKEND_URL environment variable is not set. Set it before starting the app (see .env.sample).",
  );
}
const tokenName = process.env.TOKEN_NAME ?? "token";
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
  simpleDateRegex,
  tokenName,
  userSummaryMode,
  userTimeSeriesMode,
};
