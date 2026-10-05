import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CorrectFieldDialog from "@/modules/form/route-form-viewer/route-review/components/CorrectFieldDialog";
import { ReviewField } from "@/modules/form/route-form-viewer/route-review/reviewTypes";

const toastSuccess = vi.fn();
vi.mock("@/components/utility/CustomToast", () => ({
  CustomToast: { success: (...args: unknown[]) => toastSuccess(...args) },
}));

function field(overrides: Partial<ReviewField> = {}): ReviewField {
  return {
    fieldName: "fan_count",
    label: "Fan count",
    inputType: "INT",
    value: "5",
    source: null,
    editable: true,
    ...overrides,
  };
}

function renderDialog(target: ReviewField | null, handlers = {}) {
  const onClose = vi.fn();
  const onSaved = vi.fn();
  render(
    <CorrectFieldDialog
      taskId="t1"
      target={target ? { responseId: "r1", field: target } : null}
      onClose={onClose}
      onSaved={onSaved}
      {...handlers}
    />,
  );
  return { onClose, onSaved };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe("CorrectFieldDialog", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("renders nothing while no field is being corrected", () => {
    renderDialog(null);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("starts with the current value and Save disabled until it changes", () => {
    renderDialog(field());

    expect(screen.getByText("Correct: Fan count")).toBeInTheDocument();
    expect(screen.getByLabelText("New value")).toHaveValue(5);
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("tells the reviewer when the value came from AI", () => {
    renderDialog(field({ source: "llm_extracted" }));

    expect(screen.getByText(/extracted by AI/)).toBeInTheDocument();
  });

  it("blocks a value of the wrong type and says why", async () => {
    renderDialog(field());

    const input = screen.getByLabelText("New value");
    await userEvent.clear(input);
    await userEvent.type(input, "2.5");

    expect(screen.getByText("Must be a whole number")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("sends the new value and reason, then reports the saved field", async () => {
    const saved = field({ value: "7" });
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ value: saved }));
    const { onSaved } = renderDialog(field());

    const input = screen.getByLabelText("New value");
    await userEvent.clear(input);
    await userEvent.type(input, "7");
    await userEvent.type(screen.getByLabelText("Reason (optional)"), "typo");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith("r1", saved));
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/tasks/t1/review/r1/fields/fan_count",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ value: "7", reason: "typo" }),
      }),
    );
    expect(toastSuccess).toHaveBeenCalledWith("Correction saved", undefined, {
      duration: 3000,
    });
  });

  it("shows the server's message and keeps the dialog open when the save is refused", async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ error: "Value must be a whole number" }, 400),
    );
    const { onSaved, onClose } = renderDialog(field());

    const input = screen.getByLabelText("New value");
    await userEvent.clear(input);
    await userEvent.type(input, "7");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Value must be a whole number"),
    ).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    // Still editable so the reviewer can fix it and retry.
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  it("shows a generic message when the server can't be reached", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));
    renderDialog(field());

    const input = screen.getByLabelText("New value");
    await userEvent.clear(input);
    await userEvent.type(input, "7");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Could not reach the server. Please try again."),
    ).toBeInTheDocument();
  });

  it("closes without saving on Cancel", async () => {
    const { onClose } = renderDialog(field());

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onClose).toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});
