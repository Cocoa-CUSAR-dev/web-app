import { describe, expect, it } from "vitest";

import { ReminderRecipient } from "@/modules/form/reminder/reminderTypes";
import {
  defaultReminderValue,
  fromReminderDetail,
  isReminderValid,
  replaceRecipientsOfType,
  toReminderRequest,
  toTimeInput,
} from "@/modules/form/reminder/reminderUtils";

const farmer: ReminderRecipient = { type: "ROLE", id: "r1", label: "farmer" };
const somchai: ReminderRecipient = { type: "USER", id: "u1", label: "somchai" };

describe("reminderUtils", () => {
  it("starts switched off with a 09:00 default and no recipients", () => {
    expect(defaultReminderValue()).toEqual({
      enabled: false,
      timeOfDay: "09:00",
      recipients: [],
    });
  });

  it("trims the backend's HH:mm:ss down to HH:mm for the time input", () => {
    expect(toTimeInput("17:00:00")).toBe("17:00");
    expect(toTimeInput(null)).toBe("09:00");
  });

  it("turns a backend detail into editable form values", () => {
    expect(
      fromReminderDetail({
        scheduleId: "s1",
        enabled: true,
        timeOfDay: "10:30:00",
        recipients: [farmer],
      }),
    ).toEqual({ enabled: true, timeOfDay: "10:30", recipients: [farmer] });
  });

  it("sends only type and id for each recipient (labels are display-only)", () => {
    expect(
      toReminderRequest({
        enabled: true,
        timeOfDay: "09:00",
        recipients: [farmer, somchai],
      }),
    ).toEqual({
      enabled: true,
      timeOfDay: "09:00",
      recipients: [
        { type: "ROLE", id: "r1" },
        { type: "USER", id: "u1" },
      ],
    });
  });

  it("is valid when off, or on with a time; invalid when on without one", () => {
    expect(isReminderValid({ ...defaultReminderValue(), timeOfDay: "" })).toBe(
      true,
    );
    expect(isReminderValid({ ...defaultReminderValue(), enabled: true })).toBe(
      true,
    );
    expect(
      isReminderValid({
        ...defaultReminderValue(),
        enabled: true,
        timeOfDay: "",
      }),
    ).toBe(false);
  });

  it("replaces one type of recipient and leaves the other alone", () => {
    const other: ReminderRecipient = {
      type: "ROLE",
      id: "r2",
      label: "processor",
    };

    expect(replaceRecipientsOfType([farmer, somchai], "ROLE", [other])).toEqual(
      [somchai, other],
    );
    expect(replaceRecipientsOfType([farmer, somchai], "USER", [])).toEqual([
      farmer,
    ]);
  });
});
