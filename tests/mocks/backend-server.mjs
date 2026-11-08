// Minimal stand-in for the merged backend, used only during Playwright
// E2E runs so `BACKEND_URL` resolves to something real. Started as a second
// Playwright `webServer` entry (see playwright.config.ts) — no test framework
// dependency, plain Node http server.
import http from "node:http";

import {
  applyCorrection,
  applyFormEdit,
  authUser,
  buildSummary,
  buildTimeSeries,
  FARMER_TOKEN_VALUE,
  farmerUser,
  FORBIDDEN_REVIEW_FORM,
  getDiary,
  getFormById,
  getFormList,
  getHistoryAnswers,
  getHistoryDays,
  getReview,
  getTaskByFormId,
  getTasks,
  resetReview,
  reviewCorrections,
  meFor,
  REFRESH_TOKEN_VALUE,
  tokenPairFor,
  TOKEN_VALUE,
} from "./backend-data.mjs";

const PORT = Number(process.env.MOCK_BACKEND_PORT || 4310);

// SSO tokens already redeemed via /api/v1/auth/sso/exchange. Mirrors
// web-backend's single-use rule (auth.sso_used_token): the first redemption
// of a token gets a session, any replay is refused.
const usedSsoTokens = new Set();

function send(res, status, body, extraHeaders = {}) {
  const payload = body === undefined ? "" : JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
    ...extraHeaders,
  });
  res.end(payload);
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

// The merged backend keeps no cookies: the web app sends the access token it
// stored as `Authorization: Bearer <token>`.
function bearerToken(req) {
  const header = req.headers.authorization || "";
  return header.toLowerCase().startsWith("bearer ") ? header.slice(7) : null;
}

const isFarmerSession = (req) => bearerToken(req) === FARMER_TOKEN_VALUE;

const hasSession = (req) => {
  const token = bearerToken(req);
  return token === TOKEN_VALUE || token === FARMER_TOKEN_VALUE;
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const { pathname, searchParams } = url;
  const method = req.method;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  let m;

  if (pathname === "/health") {
    return send(res, 200, { ok: true });
  }

  // ---- Auth ----
  if (method === "POST" && pathname === "/api/v1/auth/login") {
    await readJsonBody(req);
    return send(res, 200, tokenPairFor(authUser, TOKEN_VALUE));
  }

  if (method === "POST" && pathname === "/api/v1/auth/refresh") {
    const { refresh_token } = await readJsonBody(req);
    if (refresh_token !== REFRESH_TOKEN_VALUE) {
      return send(res, 401, { detail: "Refresh token is not valid" });
    }
    return send(res, 200, tokenPairFor(authUser, TOKEN_VALUE));
  }

  if (method === "POST" && pathname === "/api/v1/auth/sso/exchange") {
    const { token } = await readJsonBody(req);
    if (typeof token !== "string" || token === "" || usedSsoTokens.has(token)) {
      return send(res, 401, { detail: "invalid sso token" });
    }
    usedSsoTokens.add(token);
    return token.startsWith("farmer-")
      ? send(res, 200, tokenPairFor(farmerUser, FARMER_TOKEN_VALUE))
      : send(res, 200, tokenPairFor(authUser, TOKEN_VALUE));
  }

  if (method === "GET" && pathname === "/api/v1/me") {
    if (!hasSession(req)) {
      return send(res, 401, { detail: "Missing bearer token" });
    }
    return send(res, 200, meFor(isFarmerSession(req) ? farmerUser : authUser));
  }

  // The routes below answer the way backend-hub does: the data itself, with no
  // { value, error } around it (the web app's own API routes add that for the
  // pages). Routes the hub does not serve yet (the review table and the admin
  // list, hub PRs #22 and #24) still answer in web-backend's wrapped shape.

  // ---- A farmer's own history (docs-and-plan#231) ----
  // Only the farmer session has any; anyone else gets an empty history,
  // the way web-backend scopes /me/** to the caller.
  if (method === "GET" && pathname === "/api/v1/me/history") {
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 50);
    if (!Number.isInteger(page) || page < 0 || !(size >= 1 && size <= 500)) {
      return send(res, 400, { detail: "invalid page" });
    }
    const value = isFarmerSession(req) ? getHistoryDays(page, size) : [];
    return send(res, 200, value);
  }

  m = pathname.match(/^\/api\/v1\/me\/history\/(\d{4}-\d{2}-\d{2})$/);
  if (method === "GET" && m) {
    const value = isFarmerSession(req) ? getHistoryAnswers(m[1]) : [];
    return send(res, 200, value);
  }

  m = pathname.match(/^\/api\/v1\/me\/diaries\/(\d{4}-\d{2}-\d{2})$/);
  if (method === "GET" && m) {
    const diary = isFarmerSession(req) ? getDiary(m[1]) : null;
    if (!diary) return send(res, 404, { detail: "no diary" });
    return send(res, 200, diary);
  }

  if (method === "POST" && pathname === "/api/v1/auth/logout") {
    await readJsonBody(req);
    return send(res, 204);
  }

  if (method === "PATCH" && pathname === "/api/v1/auth/reset-password") {
    await readJsonBody(req);
    return send(res, 200, tokenPairFor(authUser, TOKEN_VALUE));
  }

  // ---- Forms ----
  // ?include=stats is the researcher's task list: the forms with their
  // answer statistics (it was GET /tasks on the old backend).
  const withStats = searchParams.get("include") === "stats";

  if (method === "GET" && pathname === "/api/v1/forms") {
    return withStats
      ? send(res, 200, getTasks())
      : send(res, 200, getFormList());
  }

  // ---- Review & correct (US2-8): the answers of a form ----
  m = pathname.match(/^\/api\/v1\/forms\/([^/]+)\/responses$/);
  if (method === "GET" && m && searchParams.get("view") === "review") {
    if (m[1] === FORBIDDEN_REVIEW_FORM) {
      return send(res, 403, { detail: "forbidden" });
    }
    const value = getReview(m[1], {
      aiOnly: searchParams.get("aiOnly") === "true",
      page: Number(searchParams.get("page") ?? 0),
      size: Number(searchParams.get("size") ?? 20),
    });
    return send(res, 200, { value, error: null });
  }

  if (method === "GET" && m) {
    // One entry per question (FormViewerIdModule maps over it). Was a bare
    // object, which left the form viewer stuck on its loading skeleton.
    return send(res, 200, { value: [], error: null });
  }

  m = pathname.match(
    /^\/api\/v1\/forms\/([^/]+)\/responses\/([^/]+)\/fields\/([^/]+)$/,
  );
  if (method === "PATCH" && m) {
    const body = await readJsonBody(req);
    const result = applyCorrection(m[1], m[2], decodeURIComponent(m[3]), body);
    if (result.status !== 200) {
      return send(res, result.status, { detail: result.error });
    }
    return send(res, 200, { value: result.field, error: null });
  }

  m = pathname.match(/^\/api\/v1\/forms\/([^/]+)$/);
  if (method === "GET" && m && withStats) {
    const task = getTaskByFormId(m[1]);
    if (!task) return send(res, 404, { detail: "task not found" });
    return send(res, 200, task);
  }
  if (method === "GET" && m) {
    const form = getFormById(m[1]);
    if (!form) return send(res, 404, { detail: "form not found" });
    return send(res, 200, form);
  }

  m = pathname.match(/^\/api\/v1\/forms\/([^/]+)\/edit$/);
  if (method === "PUT" && m) {
    const body = await readJsonBody(req);
    applyFormEdit(m[1], body.sections);
    return send(res, 200, "form updated");
  }

  // ---- Analytics: harvest ----
  m = pathname.match(/^\/api\/v1\/analytics\/harvest\/summary\/([^/]+)$/);
  if (method === "GET" && m) {
    return send(res, 200, buildSummary("harvest", m[1], from, to));
  }
  m = pathname.match(
    /^\/api\/v1\/analytics\/harvest\/spatial\/summary\/([^/]+)$/,
  );
  if (method === "POST" && m) {
    await readJsonBody(req);
    return send(res, 200, buildSummary("harvest", m[1], from, to));
  }
  m = pathname.match(/^\/api\/v1\/analytics\/harvest\/time-series\/([^/]+)$/);
  if (method === "GET" && m) {
    return send(res, 200, buildTimeSeries("harvest", m[1], from, to));
  }
  m = pathname.match(
    /^\/api\/v1\/analytics\/harvest\/spatial\/time-series\/([^/]+)$/,
  );
  if (method === "POST" && m) {
    await readJsonBody(req);
    return send(res, 200, buildTimeSeries("harvest", m[1], from, to));
  }

  // ---- Analytics: users ----
  m = pathname.match(/^\/api\/v1\/analytics\/users\/summary\/([^/]+)$/);
  if (method === "GET" && m) {
    return send(res, 200, buildSummary("user", m[1], from, to));
  }
  m = pathname.match(/^\/api\/v1\/analytics\/users\/time-series\/([^/]+)$/);
  if (method === "GET" && m) {
    return send(res, 200, buildTimeSeries("user", m[1], from, to));
  }

  // ---- Test hooks (E2E only; this server never runs outside Playwright) ----
  if (method === "POST" && pathname === "/__e2e/review/reset") {
    resetReview();
    return send(res, 200, { ok: true });
  }
  if (method === "GET" && pathname === "/__e2e/review/corrections") {
    return send(res, 200, reviewCorrections);
  }

  // ---- Admin ----
  if (method === "POST" && pathname === "/api/v1/admin/users") {
    await readJsonBody(req);
    return send(res, 201, { value: "user created", error: null });
  }

  return send(res, 404, { error: "not found" });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[mock-backend] listening on http://127.0.0.1:${PORT}`);
});