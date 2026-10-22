import { backendUrl } from "./apiConstants";

// Every URL this app calls on the backend, in one place.
//
// The browser talks to this app's own `/api/v1/...` routes; those routes (the
// BFF) call the backend with the paths below. Nothing else in `src` writes a
// backend path, so moving a group of endpoints to another backend, or
// renaming one, is a change to this file and its test.
//
// Each endpoint belongs to a group, the first segment after `/api/v1/` in the
// backend's API (`/api/v1/<group>/...`). A group can be pointed at its own
// backend with `BACKEND_URL_<GROUP>` (for example `BACKEND_URL_TASKS`); a
// group with no such variable uses `BACKEND_URL`. That lets the groups move to
// a new backend one at a time.
//
// The paths are what the backend serves today. Two of them look odd on
// purpose and are kept exactly: the harvest summary lives under
// `/api/v1/harvest/...` rather than `/api/v1/analytics/...` and its spatial
// variant is spelled `spartial`.

const backendGroups = [
  "auth",
  "me",
  "admin",
  "forms",
  "tasks",
  "analytics",
  "harvest",
  "reminders",
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
    me: endpoint("auth", "/api/v1/auth/me"),
    resetPassword: endpoint("auth", "/api/v1/auth/reset-password"),
    ssoExchange: endpoint("auth", "/api/v1/auth/sso/exchange"),
  },
  me: {
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
    byId: (id: string) => endpoint("forms", `/api/v1/forms/${id}`),
    edit: (id: string) => endpoint("forms", `/api/v1/forms/${id}/edit`),
    reminder: (id: string) => endpoint("forms", `/api/v1/forms/${id}/reminder`),
    handlers: endpoint("forms", "/api/v1/forms/handlers"),
    handlerCatalog: endpoint("forms", "/api/v1/forms/handlers/catalog"),
    handlerFields: (handler: string) =>
      endpoint("forms", `/api/v1/forms/handlers/${handler}/fields`),
  },
  tasks: {
    list: endpoint("tasks", "/api/v1/tasks"),
    byId: (taskId: string) => endpoint("tasks", `/api/v1/tasks/${taskId}`),
    responses: (taskId: string) =>
      endpoint("tasks", `/api/v1/tasks/${taskId}/responses`),
    review: (taskId: string, suffix = "") =>
      endpoint(
        "tasks",
        `/api/v1/tasks/${encodeURIComponent(taskId)}/review${suffix}`,
      ),
    correctField: (taskId: string, responseId: string, fieldName: string) =>
      endpoint(
        "tasks",
        `/api/v1/tasks/${encodeURIComponent(taskId)}/review/${encodeURIComponent(
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
  harvest: {
    summary: (spatial: boolean, mode: string, from: string, to: string) =>
      endpoint(
        "harvest",
        `/api/v1/harvest/${
          spatial ? "spartial/" : ""
        }summary/${mode}?from=${from}&to=${to}`,
      ),
  },
  reminders: {
    recipientRoles: endpoint(
      "reminders",
      "/api/v1/reminders/recipient-options/roles",
    ),
    recipientUsers: (q: string) =>
      endpoint(
        "reminders",
        `/api/v1/reminders/recipient-options/users?q=${encodeURIComponent(q)}`,
      ),
  },
  reports: {
    rawDataDownload: (suffix = "") =>
      endpoint("reports", `/api/v1/reports/raw-data/download${suffix}`),
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
