import { backendUrl } from "./apiConstants";

// Every URL this app calls on the backend, in one place.
//
// The browser talks to this app's own `/api/v1/...` routes; those routes (the
// BFF) call the backend with the paths below. Nothing else in `src` writes a
// backend path, so moving a group of endpoints to another backend, or
// renaming one, is a change to this file and its test.
//
// The paths are the After sheet of api-migration-map.xlsx: the one backend
// that replaces web-backend (Kotlin) and mobile-backend (Go). Each endpoint
// belongs to a group, the first segment after `/api/v1/` (`/api/v1/<group>/...`).
// A group can be pointed at its own backend with `BACKEND_URL_<GROUP>` (for
// example `BACKEND_URL_FORMS`); a group with no such variable uses
// `BACKEND_URL`. That lets the groups move over one at a time.
//
// The old web-backend paths that changed, for anyone reading an old log:
//   /auth/me                       -> /me
//   /tasks, /tasks/{id}            -> /forms?include=stats, /forms/{id}?include=stats
//   /tasks/{id}/responses          -> /forms/{id}/responses
//   /tasks/{id}/review             -> /forms/{id}/responses?view=review
//   /tasks/{id}/review/{r}/fields  -> /forms/{id}/responses/{r}/fields
//   /reminders/recipient-options   -> /forms/reminder-recipients
//   /harvest/(spartial/)summary    -> /analytics/harvest/(spatial/)summary
//   /reports/raw-data/download     -> /reports/raw-data

const backendGroups = [
  "auth",
  "me",
  "admin",
  "forms",
  "analytics",
  "reports",
] as const;

type BackendGroup = (typeof backendGroups)[number];

interface BackendEndpoint {
  readonly group: BackendGroup;
  readonly path: string;
}

function endpoint(group: BackendGroup, path: string): BackendEndpoint {
  return { group, path };
}

const backendEndpoints = {
  auth: {
    login: endpoint("auth", "/api/v1/auth/login"),
    logout: endpoint("auth", "/api/v1/auth/logout"),
    resetPassword: endpoint("auth", "/api/v1/auth/reset-password"),
    ssoExchange: endpoint("auth", "/api/v1/auth/sso/exchange"),
  },
  me: {
    self: endpoint("me", "/api/v1/me"),
    // `suffix` is an already-built query string: "" or "?limit=..&offset=..".
    history: (suffix = "") => endpoint("me", `/api/v1/me/history${suffix}`),
    historyOn: (date: string) => endpoint("me", `/api/v1/me/history/${date}`),
    diary: (date: string) => endpoint("me", `/api/v1/me/diaries/${date}`),
  },
  admin: {
    users: endpoint("admin", "/api/v1/admin/users"),
  },
  forms: {
    list: endpoint("forms", "/api/v1/forms"),
    // The researcher's task list: every form with its answer statistics.
    listWithStats: endpoint("forms", "/api/v1/forms?include=stats"),
    byId: (id: string) => endpoint("forms", `/api/v1/forms/${id}`),
    byIdWithStats: (id: string) =>
      endpoint("forms", `/api/v1/forms/${id}?include=stats`),
    edit: (id: string) => endpoint("forms", `/api/v1/forms/${id}/edit`),
    reminder: (id: string) => endpoint("forms", `/api/v1/forms/${id}/reminder`),
    handlers: endpoint("forms", "/api/v1/forms/handlers"),
    // Not on the After sheet: web-backend serves it and the form builder
    // needs it, so it keeps its path until the sheet has a row for it.
    handlerCatalog: endpoint("forms", "/api/v1/forms/handlers/catalog"),
    handlerFields: (handler: string) =>
      endpoint("forms", `/api/v1/forms/handlers/${handler}/fields`),
    reminderRecipientRoles: endpoint(
      "forms",
      "/api/v1/forms/reminder-recipients/roles",
    ),
    reminderRecipientUsers: (q: string) =>
      endpoint(
        "forms",
        `/api/v1/forms/reminder-recipients/users?q=${encodeURIComponent(q)}`,
      ),
    responses: (id: string) =>
      endpoint("forms", `/api/v1/forms/${id}/responses`),
    // `suffix` is an already-built query string: "" or "?page=1&size=20".
    reviewResponses: (id: string, suffix = "") =>
      endpoint(
        "forms",
        `/api/v1/forms/${encodeURIComponent(id)}/responses?view=review${
          suffix ? `&${suffix.replace(/^\?/, "")}` : ""
        }`,
      ),
    correctField: (id: string, responseId: string, fieldName: string) =>
      endpoint(
        "forms",
        `/api/v1/forms/${encodeURIComponent(id)}/responses/${encodeURIComponent(
          responseId,
        )}/fields/${encodeURIComponent(fieldName)}`,
      ),
  },
  analytics: {
    userSummary: (mode: string, from: string, to: string) =>
      endpoint(
        "analytics",
        `/api/v1/analytics/users/summary/${mode}?from=${from}&to=${to}`,
      ),
    userTimeSeries: (mode: string, from: string, to: string) =>
      endpoint(
        "analytics",
        `/api/v1/analytics/users/time-series/${mode}?from=${from}&to=${to}`,
      ),
    harvestSummary: (
      spatial: boolean,
      mode: string,
      from: string,
      to: string,
    ) =>
      endpoint(
        "analytics",
        `/api/v1/analytics/harvest/${
          spatial ? "spatial/" : ""
        }summary/${mode}?from=${from}&to=${to}`,
      ),
    harvestTimeSeries: (
      spatial: boolean,
      mode: string,
      from: string,
      to: string,
    ) =>
      endpoint(
        "analytics",
        `/api/v1/analytics/harvest/${
          spatial ? "spatial/" : ""
        }time-series/${mode}?from=${from}&to=${to}`,
      ),
  },
  reports: {
    rawData: (suffix = "") =>
      endpoint("reports", `/api/v1/reports/raw-data${suffix}`),
  },
};

// `BACKEND_URL_AUTH`, `BACKEND_URL_TASKS`, ... or else `BACKEND_URL`.
function backendUrlFor(group: BackendGroup): string | undefined {
  const override = process.env[`BACKEND_URL_${group.toUpperCase()}`];
  return override || backendUrl;
}

// The full URL to fetch for an endpoint.
function backendHref({ group, path }: BackendEndpoint): string {
  return `${backendUrlFor(group)}${path}`;
}

export type { BackendEndpoint, BackendGroup };
export { backendEndpoints, backendGroups, backendHref, backendUrlFor };
