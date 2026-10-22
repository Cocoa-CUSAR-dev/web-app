import { describe, expect, it } from "vitest";

import { RecurrenceValue } from "@/modules/form/recurrence/recurrenceTypes";
import {
  defaultRecurrenceValue,
  describeRecurrence,
  recurrenceError,
  toRecurrenceRequest,
  WEEKDAYS,
} from "@/modules/form/recurrence/recurrenceUtils";

function value(overrides: Partial<RecurrenceValue> = {}): RecurrenceValue {
  return { ...defaultRecurrenceValue(), ...overrides };
}

const OPENS = "2026-10-05T08:00";
const CLOSES = "2026-10-05T17:00";

describe("defaultRecurrenceValue", () => {
  it("is a one-off task", () => {
    expect(defaultRecurrenceValue()).toEqual({
      frequency: "NONE",
      weekdays: [],
      untilDate: "",
    });
  });
});

describe("WEEKDAYS", () => {
  it("numbers Monday as 1 and Sunday as 7, like the backend", () => {
    expect(WEEKDAYS[0]).toEqual({ value: 1, label: "Mon" });
    expect(WEEKDAYS[6]).toEqual({ value: 7, label: "Sun" });
    expect(WEEKDAYS).toHaveLength(7);
  });
});

describe("toRecurrenceRequest", () => {
  it("sends nothing for a one-off task", () => {
    expect(toRecurrenceRequest(value())).toBeUndefined();
  });

  it("sends a daily task with no weekdays, even if some were left ticked", () => {
    expect(
      toRecurrenceRequest(value({ frequency: "DAILY", weekdays: [1, 4] })),
    ).toEqual({ frequency: "DAILY" });
  });

  it("sends a weekly task's weekdays in order", () => {
    expect(
      toRecurrenceRequest(value({ frequency: "WEEKLY", weekdays: [4, 1] })),
    ).toEqual({ frequency: "WEEKLY", weekdays: [1, 4] });
  });

  it("includes the end date only when one is set", () => {
    expect(
      toRecurrenceRequest(
        value({ frequency: "DAILY", untilDate: "2026-12-31" }),
      ),
    ).toEqual({ frequency: "DAILY", untilDate: "2026-12-31" });
    expect(
      toRecurrenceRequest(value({ frequency: "DAILY", untilDate: "" })),
    ).not.toHaveProperty("untilDate");
  });
});

describe("recurrenceError", () => {
  it("never complains about a one-off task, whatever its dates", () => {
    expect(recurrenceError(value(), CLOSES, OPENS)).toBeNull();
  });

  it("accepts a daily task with sensible dates", () => {
    expect(
      recurrenceError(value({ frequency: "DAILY" }), OPENS, CLOSES),
    ).toBeNull();
  });

  it("asks for a weekday on a weekly task", () => {
    expect(recurrenceError(value({ frequency: "WEEKLY" }), OPENS, CLOSES)).toBe(
      "Pick at least one weekday",
    );
    expect(
      recurrenceError(
        value({ frequency: "WEEKLY", weekdays: [1] }),
        OPENS,
        CLOSES,
      ),
    ).toBeNull();
  });

  it("requires a repeating task to close after it opens", () => {
    expect(recurrenceError(value({ frequency: "DAILY" }), CLOSES, OPENS)).toBe(
      "A repeating task must close after it opens",
    );
    expect(recurrenceError(value({ frequency: "DAILY" }), OPENS, OPENS)).toBe(
      "A repeating task must close after it opens",
    );
  });

  it("does not judge the dates before both are filled in", () => {
    expect(
      recurrenceError(value({ frequency: "DAILY" }), "", CLOSES),
    ).toBeNull();
    expect(
      recurrenceError(value({ frequency: "DAILY" }), OPENS, ""),
    ).toBeNull();
  });

  it("refuses an end date before the day the task opens, accepts that day itself", () => {
    expect(
      recurrenceError(
        value({ frequency: "DAILY", untilDate: "2026-10-04" }),
        OPENS,
        CLOSES,
      ),
    ).toBe("The end date can't be before the day the task opens");
    expect(
      recurrenceError(
        value({ frequency: "DAILY", untilDate: "2026-10-05" }),
        OPENS,
        CLOSES,
      ),
    ).toBeNull();
  });
});

describe("describeRecurrence", () => {
  it("says so for a one-off task", () => {
    expect(describeRecurrence(value())).toBe("Does not repeat");
  });

  it("describes daily, with and without an end date", () => {
    expect(describeRecurrence(value({ frequency: "DAILY" }))).toBe("Every day");
    expect(
      describeRecurrence(
        value({ frequency: "DAILY", untilDate: "2026-12-31" }),
      ),
    ).toBe("Every day, until 2026-12-31");
  });

  it("names the weekdays of a weekly task in order", () => {
    expect(
      describeRecurrence(
        value({
          frequency: "WEEKLY",
          weekdays: [4, 1],
          untilDate: "2026-12-31",
        }),
      ),
    ).toBe("Every week on Mon, Thu, until 2026-12-31");
  });
});
