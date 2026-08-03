// Minimal stand-in for the Kotlin web-backend, used only during Playwright
// E2E runs so `BACKEND_URL` resolves to something real. Started as a second
// Playwright `webServer` entry (see playwright.config.ts) — no test framework
// dependency, plain Node http server.
import http from "node:http";

import {
  applyFormEdit,
  authUser,
  buildSummary,
  buildTimeSeries,
  getFormById,
  getFormList,
  getTaskById,
  getTasks,
  TOKEN_NAME,
  TOKEN_VALUE,
} from "./backend-data.mjs";

const PORT = Number(process.env.MOCK_BACKEND_PORT || 4310);

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

function hasSessionCookie(req) {
  const cookieHeader = req.headers.cookie || "";
  return cookieHeader.split(";").some((part) => {
    const [name] = part.trim().split("=");
    return name === TOKEN_NAME;
  });
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

  // ---- Auth ----
  if (method === "POST" && pathname === "/api/v1/auth/login") {
    await readJsonBody(req);
    return send(
      res,
      200,
      { value: "login success", error: null },
      { "Set-Cookie": `${TOKEN_NAME}=${TOKEN_VALUE}; Path=/; HttpOnly` },
    );
  }

  if (method === "GET" && pathname === "/api/v1/auth/me") {
    if (!hasSessionCookie(req)) {
      return send(res, 401, { value: null, error: "unauthorized" });
    }
    return send(res, 200, { value: authUser, error: null });
  }

  if (method === "GET" && pathname === "/api/v1/auth/logout") {
    return send(
      res,
      200,
      { value: "logout successful", error: null },
      { "Set-Cookie": `${TOKEN_NAME}=; Path=/; Max-Age=0` },
    );
  }

  if (method === "PATCH" && pathname === "/api/v1/auth/reset-password") {
    await readJsonBody(req);
    return send(res, 200, { value: "password reset", error: null });
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
    return send(res, 200, {
      value: { questionTitle: "", answers: [] },
      error: null,
    });
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
