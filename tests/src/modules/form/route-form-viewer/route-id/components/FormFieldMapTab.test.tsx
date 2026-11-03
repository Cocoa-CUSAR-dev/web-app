import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FormFieldMapTab from "@/modules/form/route-form-viewer/route-id/components/FormFieldMapTab";

// The tab is given the FORM id (the viewer's URL). It finds that form in the
// list for its handler, then reads the form itself by the same id.
const FORM_ID = "f0f0f0f0-0000-4000-8000-000000000001";
const OTHER_FORM_ID = "f0f0f0f0-0000-4000-8000-000000000009";
const TASK_ID = "a1a1a1a1-0000-4000-8000-000000000002";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function listEntry(formId: string) {
  return {
    formId,
    taskId: TASK_ID,
    title: "จดกิจกรรมในสวน",
    description: null,
    content: "",
    handler: "farm_activity",
    isMultipleSubmit: false,
    createdAt: "2026-01-01T00:00:00",
  };
}

function stubBackend(formsInList: string[]) {
  vi.mocked(fetch).mockImplementation(async (input) => {
    const url = String(input);
    if (url === "/api/v1/forms") {
      return jsonResponse({ value: formsInList.map(listEntry) });
    }
    if (url === "/api/v1/forms/handlers/catalog") {
      return jsonResponse({
        value: {
          handlers: [],
          dependencies: [],
          registrationTables: [],
          fieldLabels: {},
        },
      });
    }
    return jsonResponse({
      value: {
        formId: FORM_ID,
        title: "จดกิจกรรมในสวน",
        description: null,
        sections: [],
      },
    });
  });
}

function requestedUrls() {
  return vi.mocked(fetch).mock.calls.map(([input]) => String(input));
}

describe("FormFieldMapTab", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("reads the form by the form id it was given, never by the task id", async () => {
    stubBackend([OTHER_FORM_ID, FORM_ID]);

    render(<FormFieldMapTab formId={FORM_ID} />);

    await waitFor(() => {
      expect(requestedUrls()).toContain(`/api/v1/forms/${FORM_ID}`);
    });
    expect(requestedUrls().join(" ")).not.toContain(TASK_ID);
    expect(requestedUrls()).not.toContain(`/api/v1/forms/${OTHER_FORM_ID}`);
  });

  it("says it failed when the form is not in the list", async () => {
    stubBackend([OTHER_FORM_ID]);

    render(<FormFieldMapTab formId={FORM_ID} />);

    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
    expect(requestedUrls()).not.toContain(`/api/v1/forms/${FORM_ID}`);
  });
});
