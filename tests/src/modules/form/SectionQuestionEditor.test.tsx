import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import SectionQuestionEditor, {
  emptySection,
  MultipleSubmitCheckbox,
} from "@/modules/form/route-form-create/components/SectionQuestionEditor";
import { SectionInput } from "@/modules/form/route-form-create/formCreateTypes";

function Harness({
  isMultipleSubmit,
  onChange,
}: {
  isMultipleSubmit: boolean;
  onChange?: (sections: SectionInput[]) => void;
}) {
  const [sections, setSections] = useState<SectionInput[]>([emptySection()]);
  onChange?.(sections);
  return (
    <SectionQuestionEditor
      sections={sections}
      setSections={setSections}
      handler={""}
      handlerFields={null}
      isMultipleSubmit={isMultipleSubmit}
    />
  );
}

describe("SectionQuestionEditor carry-forward", () => {
  it("hides 'Reuse answer' on single-submit forms", () => {
    render(<Harness isMultipleSubmit={false} />);
    expect(screen.queryByLabelText("Reuse answer")).not.toBeInTheDocument();
  });

  it("sets carryForward on the question when ticked", async () => {
    const onChange = vi.fn();
    render(<Harness isMultipleSubmit onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("Reuse answer"));

    const latest: SectionInput[] = onChange.mock.lastCall![0];
    expect(latest[0].questions[0].carryForward).toBe(true);
  });
});

describe("MultipleSubmitCheckbox", () => {
  it("reports the new checked state", async () => {
    const onChange = vi.fn();
    render(<MultipleSubmitCheckbox checked={false} onChange={onChange} />);

    await userEvent.click(screen.getByLabelText("Allow multiple submissions"));

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
