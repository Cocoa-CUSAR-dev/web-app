import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import RecurrenceSettings from "@/modules/form/recurrence/RecurrenceSettings";
import { RecurrenceValue } from "@/modules/form/recurrence/recurrenceTypes";
import { defaultRecurrenceValue } from "@/modules/form/recurrence/recurrenceUtils";

const OPENS = "2026-10-05T08:00";
const CLOSES = "2026-10-05T17:00";

// Holds the value like the create-form page does, and reports every change.
function Harness({
  initial = defaultRecurrenceValue(),
  openAt = OPENS,
  closeAt = CLOSES,
  onChange,
}: {
  initial?: RecurrenceValue;
  openAt?: string;
  closeAt?: string;
  onChange?: (value: RecurrenceValue) => void;
}) {
  const [value, setValue] = useState<RecurrenceValue>(initial);
  onChange?.(value);
  return (
    <RecurrenceSettings
      value={value}
      onChange={setValue}
      openAt={openAt}
      closeAt={closeAt}
    />
  );
}

async function chooseFrequency(label: string) {
  await userEvent.click(screen.getByRole("combobox", { name: "Repeat" }));
  await userEvent.click(await screen.findByRole("option", { name: label }));
}

describe("RecurrenceSettings", () => {
  it("starts as a one-off task and shows no other controls", () => {
    render(<Harness />);

    expect(screen.getByRole("combobox", { name: "Repeat" })).toHaveTextContent(
      "Does not repeat",
    );
    expect(
      screen.queryByLabelText(/Stop repeating after/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("On these days")).not.toBeInTheDocument();
  });

  it("offers an end date, but no weekdays, for a daily task", async () => {
    render(<Harness />);

    await chooseFrequency("Every day");

    expect(screen.getByLabelText(/Stop repeating after/)).toBeInTheDocument();
    expect(screen.queryByText("On these days")).not.toBeInTheDocument();
  });

  it("offers weekday buttons for a weekly task and keeps them in order", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await chooseFrequency("Every week");
    // Hit Thursday first, then Monday.
    await userEvent.click(screen.getByRole("button", { name: "Thu" }));
    await userEvent.click(screen.getByRole("button", { name: "Mon" }));

    expect(onChange).toHaveBeenLastCalledWith({
      frequency: "WEEKLY",
      weekdays: [1, 4],
      untilDate: "",
    });
  });

  it("lets a ticked weekday be unticked", async () => {
    const onChange = vi.fn();
    render(
      <Harness
        initial={{ frequency: "WEEKLY", weekdays: [1, 4], untilDate: "" }}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Mon" }));

    expect(onChange).toHaveBeenLastCalledWith({
      frequency: "WEEKLY",
      weekdays: [4],
      untilDate: "",
    });
  });

  it("warns that a weekly task needs a weekday", () => {
    render(
      <Harness
        initial={{ frequency: "WEEKLY", weekdays: [], untilDate: "" }}
      />,
    );

    expect(
      within(screen.getByRole("alert")).getByText("Pick at least one weekday"),
    ).toBeInTheDocument();
  });

  it("warns when a repeating task closes before it opens", () => {
    render(
      <Harness
        initial={{ frequency: "DAILY", weekdays: [], untilDate: "" }}
        openAt={CLOSES}
        closeAt={OPENS}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "A repeating task must close after it opens",
    );
  });

  it("shows no warning for a valid daily task", () => {
    render(
      <Harness initial={{ frequency: "DAILY", weekdays: [], untilDate: "" }} />,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("records the chosen end date", async () => {
    const onChange = vi.fn();
    render(
      <Harness
        initial={{ frequency: "DAILY", weekdays: [], untilDate: "" }}
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText(/Stop repeating after/);
    await userEvent.type(input, "2026-12-31");

    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ untilDate: "2026-12-31" }),
    );
  });
});
