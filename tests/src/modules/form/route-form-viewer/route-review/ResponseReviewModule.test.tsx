import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ResponseReviewModule from "@/modules/form/route-form-viewer/route-review/ResponseReviewModule";
import {
  ReviewField,
  ReviewSubmission,
} from "@/modules/form/route-form-viewer/route-review/reviewTypes";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));
vi.mock("@/components/utility/CustomToast", () => ({
  CustomToast: { success: vi.fn() },
}));

function field(overrides: Partial<ReviewField> = {}): ReviewField {
  return {
    fieldName: "fan_count",
    label: "Fan count",
    inputType: "INT",
    value: "5",
    source: "llm_extracted",
    editable: true,
    ...overrides,
  };
}

function submission(
  id: string,
  submitter: string,
  fields: ReviewField[] = [field()],
): ReviewSubmission {
  return {
    responseId: id,
    submitter,
    submittedAt: "2026-09-27T02:30:00",
    fields,
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

// Routes the module's three calls: the task title, the review list and the
// PATCH. `reviewBodies` is consumed one entry per list request.
function stubBackend(opts: {
  reviewBodies?: unknown[];
  reviewStatus?: number;
  patch?: () => Response;
}) {
  const reviewBodies = [...(opts.reviewBodies ?? [{ value: [] }])];
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const url = String(input);
    if (init?.method === "PATCH") {
      return opts.patch ? opts.patch() : jsonResponse({ value: field() });
    }
    if (url.includes("/review")) {
      if (opts.reviewStatus && opts.reviewStatus !== 200) {
        return jsonResponse({ error: "x" }, opts.reviewStatus);
      }
      return jsonResponse(reviewBodies.shift() ?? { value: [] });
    }
    return jsonResponse({ value: { title: "Rice survey" } });
  });
}

function reviewCalls() {
  // GETs of the list only; the PATCH url contains "/review" too.
  return vi
    .mocked(fetch)
    .mock.calls.filter(([, init]) => init?.method !== "PATCH")
    .map(([input]) => String(input))
    .filter((url) => url.includes("/review"));
}

describe("ResponseReviewModule", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("shows the task name and one card per submission", async () => {
    stubBackend({
      reviewBodies: [
        { value: [submission("r1", "Somchai"), submission("r2", "Malee")] },
      ],
    });

    render(<ResponseReviewModule taskId="t1" />);

    expect(await screen.findByText("Somchai")).toBeInTheDocument();
    expect(screen.getByText("Malee")).toBeInTheDocument();
    expect(await screen.findByText("Rice survey")).toBeInTheDocument();
    expect(reviewCalls()[0]).toBe(
      "/api/v1/tasks/t1/review?aiOnly=false&page=0&size=20",
    );
  });

  it("says so when there is nothing to review", async () => {
    stubBackend({ reviewBodies: [{ value: [] }] });

    render(<ResponseReviewModule taskId="t1" />);

    expect(
      await screen.findByText("There are no submissions to review yet."),
    ).toBeInTheDocument();
  });

  it("asks the backend for AI-extracted submissions only when the switch is on", async () => {
    stubBackend({
      reviewBodies: [
        { value: [submission("r1", "Somchai")] },
        { value: [submission("r2", "Malee")] },
      ],
    });

    render(<ResponseReviewModule taskId="t1" />);
    await screen.findByText("Somchai");
    await userEvent.click(screen.getByLabelText("AI-extracted only"));

    expect(await screen.findByText("Malee")).toBeInTheDocument();
    expect(reviewCalls()[1]).toBe(
      "/api/v1/tasks/t1/review?aiOnly=true&page=0&size=20",
    );
  });

  it("explains a permission error instead of showing an empty list", async () => {
    stubBackend({ reviewStatus: 403 });

    render(<ResponseReviewModule taskId="t1" />);

    expect(
      await screen.findByText(/don't have permission to review/),
    ).toBeInTheDocument();
  });

  it("pages forward only while the page is full", async () => {
    const fullPage = Array.from({ length: 20 }, (_, i) =>
      submission(`r${i}`, `Farmer ${i}`),
    );
    stubBackend({
      reviewBodies: [{ value: fullPage }, { value: [submission("x", "Last")] }],
    });

    render(<ResponseReviewModule taskId="t1" />);
    await screen.findByText("Farmer 0");
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(await screen.findByText("Last")).toBeInTheDocument();
    expect(reviewCalls()[1]).toContain("page=1");
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("shows the corrected value in the list after a save, without reloading it", async () => {
    stubBackend({
      reviewBodies: [{ value: [submission("r1", "Somchai")] }],
      patch: () => jsonResponse({ value: field({ value: "7" }) }),
    });

    render(<ResponseReviewModule taskId="t1" />);
    await screen.findByText("Somchai");
    await userEvent.click(
      screen.getByRole("button", { name: "Edit Fan count" }),
    );

    const dialog = await screen.findByRole("dialog");
    const input = within(dialog).getByLabelText("New value");
    await userEvent.clear(input);
    await userEvent.type(input, "7");
    await userEvent.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(reviewCalls()).toHaveLength(1);
  });

  it("goes back to the plain responses page", async () => {
    stubBackend({});

    render(<ResponseReviewModule taskId="t1" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Back to responses" }),
    );

    expect(push).toHaveBeenCalledWith("/form/form-viewer/t1");
  });
});
