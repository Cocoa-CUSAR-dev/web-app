import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FormViewerModule from "@/modules/form/route-form-viewer/FormViewerModule";
import FormViewerIdModule from "@/modules/form/route-form-viewer/route-id/FormViewerIdModule";

// The hub's `/forms/{id}` takes the form id. A form has one task, and the
// task list hands out both ids, so the screens have to pick the right one:
// the viewer is addressed, linked to and loaded by the FORM id.
const FORM_ID = "f0f0f0f0-0000-4000-8000-000000000001";
const TASK_ID = "a1a1a1a1-0000-4000-8000-000000000002";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/components/utility/CustomToast", () => ({
  CustomToast: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
    promise: (promise: Promise<unknown>) => promise,
  },
}));

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function requestedUrls() {
  return vi.mocked(fetch).mock.calls.map(([input]) => String(input));
}

describe("the form viewer is addressed by the form id", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("links a task in the list to its form id, not its task id", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({
        value: [
          {
            formId: FORM_ID,
            taskId: TASK_ID,
            title: "จดกิจกรรมในสวน",
            description: "",
            taskType: "FORM",
            openAt: "2026-01-01T00:00:00",
            closeAt: "2027-01-01T00:00:00",
          },
        ],
        error: null,
      }),
    );

    render(<FormViewerModule />);

    const link = await screen.findByRole("link", { name: /จดกิจกรรมในสวน/ });
    expect(link).toHaveAttribute("href", `/form/form-viewer/${FORM_ID}`);
    expect(link.getAttribute("href")).not.toContain(TASK_ID);
  });

  it("asks for the task view and the responses by the form id", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.endsWith("/responses")) return jsonResponse({ value: [] });
      return jsonResponse({ value: { title: "จดกิจกรรมในสวน" } });
    });

    render(<FormViewerIdModule formId={FORM_ID} />);

    await waitFor(() => {
      expect(requestedUrls()).toEqual(
        expect.arrayContaining([
          `/api/v1/tasks/${FORM_ID}`,
          `/api/v1/tasks/${FORM_ID}/responses`,
        ]),
      );
    });
  });

  it("opens the review screen for the same form id", async () => {
    vi.mocked(fetch).mockImplementation(async (input) =>
      String(input).endsWith("/responses")
        ? jsonResponse({ value: [] })
        : jsonResponse({ value: { title: "จดกิจกรรมในสวน" } }),
    );
    render(<FormViewerIdModule formId={FORM_ID} />);

    await userEvent
      .setup({ delay: null })
      .click(await screen.findByRole("button", { name: /Review & correct/ }));

    expect(push).toHaveBeenCalledWith(`/form/form-viewer/${FORM_ID}/review`);
  });
});
