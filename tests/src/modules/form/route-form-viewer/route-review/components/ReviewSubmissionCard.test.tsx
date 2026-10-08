import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ReviewSubmissionCard from "@/modules/form/route-form-viewer/route-review/components/ReviewSubmissionCard";
import {
  ReviewField,
  ReviewSubmission,
} from "@/modules/form/route-form-viewer/route-review/reviewTypes";

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

function submission(fields: ReviewField[]): ReviewSubmission {
  return {
    responseId: "r1",
    submitter: "Somchai",
    submittedAt: "2026-09-27T02:30:00",
    fields,
  };
}

describe("ReviewSubmissionCard", () => {
  it("shows the submitter, the time in Thai time and every field's value", () => {
    render(
      <ReviewSubmissionCard
        submission={submission([
          field(),
          field({ fieldName: "note", label: "Note", value: null }),
        ])}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("Somchai")).toBeInTheDocument();
    expect(screen.getByText("2026-09-27 09:30")).toBeInTheDocument();
    expect(screen.getByText("Fan count")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    // An unanswered question is shown, not hidden.
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("marks AI-extracted fields and counts them in the header", () => {
    render(
      <ReviewSubmissionCard
        submission={submission([
          field({ source: "llm_extracted" }),
          field({ fieldName: "b", label: "B", source: "llm_extracted" }),
          field({ fieldName: "c", label: "C", source: "guided_flow" }),
        ])}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText("2 AI-extracted")).toBeInTheDocument();
    expect(screen.getAllByText("AI-extracted")).toHaveLength(2);
    expect(screen.getByText("Chatbot")).toBeInTheDocument();
  });

  it("shows no AI badge when the chatbot didn't extract anything", () => {
    render(
      <ReviewSubmissionCard
        submission={submission([field({ source: "guided_flow" })])}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.queryByText(/AI-extracted/)).not.toBeInTheDocument();
  });

  it("calls onEdit with the response id and the field that was clicked", async () => {
    const onEdit = vi.fn();
    const target = field();
    render(
      <ReviewSubmissionCard
        submission={submission([target])}
        onEdit={onEdit}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Edit Fan count" }),
    );

    expect(onEdit).toHaveBeenCalledWith("r1", target);
  });

  it("disables Edit for a field the backend says can't be corrected", async () => {
    const onEdit = vi.fn();
    render(
      <ReviewSubmissionCard
        submission={submission([
          field({ label: "Province", inputType: "OPTION", editable: false }),
        ])}
        onEdit={onEdit}
      />,
    );

    const button = screen.getByRole("button", { name: "Edit Province" });
    expect(button).toBeDisabled();
    // MUI sets pointer-events: none on a disabled button; click it anyway to
    // prove nothing fires.
    await userEvent.setup({ pointerEventsCheck: 0 }).click(button);
    expect(onEdit).not.toHaveBeenCalled();
  });
});
