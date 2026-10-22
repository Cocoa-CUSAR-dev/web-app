import {
  RecurrenceFrequency,
  RecurrenceRequest,
  RecurrenceValue,
} from "./recurrenceTypes";

// ISO numbering, same as the backend: Monday = 1 ... Sunday = 7.
const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
];

const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  NONE: "Does not repeat",
  DAILY: "Every day",
  WEEKLY: "Every week",
};

function defaultRecurrenceValue(): RecurrenceValue {
  return { frequency: "NONE", weekdays: [], untilDate: "" };
}

// What to send, or undefined for a one-off task so the field is left out.
function toRecurrenceRequest(
  value: RecurrenceValue,
): RecurrenceRequest | undefined {
  if (value.frequency === "NONE") return undefined;
  return {
    frequency: value.frequency,
    ...(value.frequency === "WEEKLY" && {
      weekdays: [...value.weekdays].sort((a, b) => a - b),
    }),
    ...(value.untilDate && { untilDate: value.untilDate }),
  };
}

// Why the repeat settings cannot be used yet, or null when they are fine. The
// backend checks the same things; this just says so before the request. openAt
// and closeAt are "YYYY-MM-DDTHH:mm" strings, which compare correctly as text.
function recurrenceError(
  value: RecurrenceValue,
  openAt: string,
  closeAt: string,
): string | null {
  if (value.frequency === "NONE") return null;
  if (openAt && closeAt && closeAt <= openAt) {
    return "A repeating task must close after it opens";
  }
  if (value.frequency === "WEEKLY" && value.weekdays.length === 0) {
    return "Pick at least one weekday";
  }
  if (value.untilDate && openAt && value.untilDate < openAt.slice(0, 10)) {
    return "The end date can't be before the day the task opens";
  }
  return null;
}

// One line for people: "Every week on Mon, Thu, until 2026-12-31".
function describeRecurrence(value: RecurrenceValue): string {
  if (value.frequency === "NONE") return FREQUENCY_LABELS.NONE;
  const days =
    value.frequency === "WEEKLY" && value.weekdays.length > 0
      ? ` on ${[...value.weekdays]
          .sort((a, b) => a - b)
          .map((d) => WEEKDAYS.find((w) => w.value === d)?.label ?? d)
          .join(", ")}`
      : "";
  const until = value.untilDate ? `, until ${value.untilDate}` : "";
  return `${FREQUENCY_LABELS[value.frequency]}${days}${until}`;
}

export {
  defaultRecurrenceValue,
  describeRecurrence,
  FREQUENCY_LABELS,
  recurrenceError,
  toRecurrenceRequest,
  WEEKDAYS,
};
