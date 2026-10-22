// Minimal stand-in for the Kotlin web-backend and backend-hub, used only
// during Playwright E2E runs so `BACKEND_URL` and `HUB_URL` resolve to
// something real. Started as a second
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
  FORBIDDEN_REVIEW_TASK,
  getDiary,
  getFormById,
  getFormList,
  getHistoryAnswers,
  getHistoryDays,
  getReview,
  getTaskById,
  getTasks,
  resetReview,
  reviewCorrections,
  TOKEN_NAME,
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

// The web app sends the session as `Authorization: Bearer` to both
// backends; a bare cookie header is still accepted for older callers.
function sessionCookieValue(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice("Bearer ".length);
  const cookieHeader = req.headers.cookie || "";
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === TOKEN_NAME) return rest.join("=");
  }
  return null;
}

const isFarmerSession = (req) => sessionCookieValue(req) === FARMER_TOKEN_VALUE;

function hasSessionCookie(req) {
  const value = sessionCookieValue(req);
  return value === TOKEN_VALUE || value === FARMER_TOKEN_VALUE;
}

// backend-hub's login-like answer: the token pair in the body, no cookies.
function tokenPair(accessToken) {
  const user = accessToken === FARMER_TOKEN_VALUE ? farmerUser : authUser;
  return {
    access_token: accessToken,
    refresh_token: `refresh-${accessToken === FARMER_TOKEN_VALUE ? "farmer" : "admin"}`,
    token_type: "bearer",
    expires_in: 3600,
    user: {
      user_id: user.userId,
      username: user.email,
      roles: user.roles,
      must_reset_password: user.isRequiresPasswordReset && !user.isPasswordReset,
    },
  };
}

// backend-hub's GET /api/v1/me for the mock users.
function hubMe(user) {
  return {
    user_id: user.userId,
    username: user.email,
    roles: user.roles,
    must_reset_password: user.isRequiresPasswordReset && !user.isPasswordReset,
    profiles: {
      farmer: user.roles.includes("farmer") ? { first_name: user.firstName } : null,
      hub_collector: null,
      processor: null,
      researcher: user.roles.includes("researcher")
        ? {
            first_name: user.firstName,
            last_name: user.lastName,
            organization: user.organization,
          }
        : null,
    },
  };
}

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

  // ---- Auth (backend-hub contract: tokens in the body, Bearer only) ----
  if (method === "POST" && pathname === "/api/v1/auth/login") {
    await readJsonBody(req);
    return send(res, 200, tokenPair(TOKEN_VALUE));
  }

  if (method === "POST" && pathname === "/api/v1/auth/refresh") {
    const { refresh_token: refresh } = await readJsonBody(req);
    if (refresh === "refresh-admin") return send(res, 200, tokenPair(TOKEN_VALUE));
    if (refresh === "refresh-farmer") return send(res, 200, tokenPair(FARMER_TOKEN_VALUE));
    return send(res, 401, { detail: "Refresh token is not valid" });
  }

  if (method === "POST" && pathname === "/api/v1/auth/logout") {
    await readJsonBody(req);
    res.writeHead(204);
    return res.end();
  }

  if (method === "POST" && pathname === "/api/v1/auth/sso/exchange") {
    const { token } = await readJsonBody(req);
    if (typeof token !== "string" || token === "" || usedSsoTokens.has(token)) {
      return send(res, 401, { detail: "This link has already been used" });
    }
    usedSsoTokens.add(token);
    return send(
      res,
      200,
      tokenPair(token.startsWith("farmer-") ? FARMER_TOKEN_VALUE : TOKEN_VALUE),
    );
  }

  if (method === "GET" && pathname === "/api/v1/me") {
    if (!hasSessionCookie(req)) {
      return send(res, 401, { detail: "Missing bearer token" });
    }
    return send(res, 200, hubMe(isFarmerSession(req) ? farmerUser : authUser));
  }

  // ---- A farmer's own history (docs-and-plan#231) ----
  // Only the farmer session has any; anyone else gets an empty history,
  // the way web-backend scopes /me/** to the caller.
  if (method === "GET" && pathname === "/api/v1/me/history") {
    const page = Number(searchParams.get("page") ?? 0);
    const size = Number(searchParams.get("size") ?? 50);
    if (!Number.isInteger(page) || page < 0 || !(size >= 1 && size <= 500)) {
      return send(res, 400, { value: null, error: "invalid page" });
    }
    const value = isFarmerSession(req) ? getHistoryDays(page, size) : [];
    return send(res, 200, { value, error: null });
  }

  m = pathname.match(/^\/api\/v1\/me\/history\/(\d{4}-\d{2}-\d{2})$/);
  if (method === "GET" && m) {
    const value = isFarmerSession(req) ? getHistoryAnswers(m[1]) : [];
    return send(res, 200, { value, error: null });
  }

  m = pathname.match(/^\/api\/v1\/me\/diaries\/(\d{4}-\d{2}-\d{2})$/);
  if (method === "GET" && m) {
    const diary = isFarmerSession(req) ? getDiary(m[1]) : null;
    if (!diary) return send(res, 404, { value: null, error: "no diary" });
    return send(res, 200, { value: diary, error: null });
  }

  if (method === "PATCH" && pathname === "/api/v1/auth/reset-password") {
    await readJsonBody(req);
    return send(res, 200, tokenPair(sessionCookieValue(req) ?? TOKEN_VALUE));
  }

  // ---- Forms ----
  if (method === "GET" && pathname === "/api/v1/forms") {
    return send(res, 200, { value: getFormList(), error: null });
  }

  m = pathname.match(/^\/api\/v1\/forms\/([^/]+)$/);
  if (method === "GET" && m) {
    const form = getFormById(m[1]);
    if (!form) return send(res, 404, { error: "form not found" });
    return send(res, 200, { value: form, error: null });
  }

  m = pathname.match(/^\/api\/v1\/forms\/([^/]+)\/edit$/);
  if (method === "PUT" && m) {
    const body = await readJsonBody(req);
    applyFormEdit(m[1], body.sections);
    return send(res, 200, { value: "form updated", error: null });
  }

  // ---- Tasks ----
  if (method === "GET" && pathname === "/api/v1/tasks") {
    return send(res, 200, { value: getTasks(), error: null });
  }

  m = pathname.match(/^\/api\/v1\/tasks\/([^/]+)\/responses$/);
  if (method === "GET" && m) {
    // One entry per question (FormViewerIdModule maps over it). Was a bare
    // object, which left the form viewer stuck on its loading skeleton.
    return send(res, 200, { value: [], error: null });
  }

  // ---- Review & correct (US2-8) ----
  m = pathname.match(/^\/api\/v1\/tasks\/([^/]+)\/review$/);
  if (method === "GET" && m) {
    if (m[1] === FORBIDDEN_REVIEW_TASK) {
      return send(res, 403, { error: "forbidden" });
    }
    const value = getReview(m[1], {
      aiOnly: searchParams.get("aiOnly") === "true",
      page: Number(searchParams.get("page") ?? 0),
      size: Number(searchParams.get("size") ?? 20),
    });
    return send(res, 200, { value, error: null });
  }

  m = pathname.match(
    /^\/api\/v1\/tasks\/([^/]+)\/review\/([^/]+)\/fields\/([^/]+)$/,
  );
  if (method === "PATCH" && m) {
    const body = await readJsonBody(req);
    const result = applyCorrection(m[1], m[2], decodeURIComponent(m[3]), body);
    if (result.status !== 200) {
      return send(res, result.status, { value: null, error: result.error });
    }
    return send(res, 200, { value: result.field, error: null });
  }

  m = pathname.match(/^\/api\/v1\/tasks\/([^/]+)$/);
  if (method === "GET" && m) {
    const task = getTaskById(m[1]);
    if (!task) return send(res, 404, { error: "task not found" });
    return send(res, 200, { value: task, error: null });
  }

  // ---- Analytics: harvest ----
  m = pathname.match(/^\/api\/v1\/harvest\/summary\/([^/]+)$/);
  if (method === "GET" && m) {
    return send(res, 200, buildSummary("harvest", m[1], from, to));
  }
  m = pathname.match(/^\/api\/v1\/harvest\/spartial\/summary\/([^/]+)$/);
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