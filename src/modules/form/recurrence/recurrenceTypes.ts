// US4-4 (docs-and-plan#233): a task that is re-assigned automatically every
// period. Shapes mirror web-backend's Recurrence.Request.Create.

// What the form edits. NONE = a one-off task (nothing is sent).
type RecurrenceFrequency = "NONE" | "DAILY" | "WEEKLY";

type RecurrenceValue = {
  frequency: RecurrenceFrequency;
  // ISO weekday numbers, 1 = Monday ... 7 = Sunday. Only used for WEEKLY.
  weekdays: number[];
  // "YYYY-MM-DD", or "" for no end date.
  untilDate: string;
};

// What is sent to the backend.
type RecurrenceRequest = {
  frequency: "DAILY" | "WEEKLY";
  weekdays?: number[];
  untilDate?: string;
};

export type { RecurrenceFrequency, RecurrenceRequest, RecurrenceValue };
