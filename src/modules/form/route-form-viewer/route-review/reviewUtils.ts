import { ReviewField, ReviewSubmission } from "./reviewTypes";

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function isAiExtracted(field: ReviewField): boolean {
  return field.source === "llm_extracted";
}

function aiFieldCount(submission: ReviewSubmission): number {
  return submission.fields.filter(isAiExtracted).length;
}

function sourceLabel(source: ReviewField["source"]): string | null {
  if (source === "llm_extracted") return "AI-extracted";
  if (source === "guided_flow") return "Chatbot";
  return null;
}

// Swaps one corrected field into the list without touching anything else,
// so the screen can show the saved value without refetching the page.
function replaceField(
  submissions: ReviewSubmission[],
  responseId: string,
  updated: ReviewField,
): ReviewSubmission[] {
  return submissions.map((submission) =>
    submission.responseId !== responseId
      ? submission
      : {
          ...submission,
          fields: submission.fields.map((field) =>
            field.fieldName === updated.fieldName ? updated : field,
          ),
        },
  );
}

// form.response.submitted_at is stored as UTC wall-clock; the farmer's
// (and researcher's) day is Asia/Bangkok. Done by hand rather than with
// Intl so the output doesn't depend on the ICU version ("Sep" vs "Sept").
function formatSubmittedAt(submittedAt: string | null): string {
  if (!submittedAt) return "-";
  const utc = new Date(`${submittedAt}Z`);
  if (Number.isNaN(utc.getTime())) return submittedAt;
  const bangkok = new Date(utc.getTime() + BANGKOK_OFFSET_MS);
  return bangkok.toISOString().slice(0, 16).replace("T", " ");
}

type InputKind = "text" | "number" | "date" | "datetime-local" | "boolean";

function inputKind(inputType: string): InputKind {
  switch (inputType.toUpperCase()) {
    case "INT":
    case "FLOAT":
      return "number";
    case "DATE":
      return "date";
    case "DATETIME":
      return "datetime-local";
    case "BOOLEAN":
      return "boolean";
    default:
      return "text";
  }
}

function isRealDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

// A quick check so Save can be disabled before a round trip. web-backend's
// AnswerCoercion stays the source of truth (and rejects anything this lets
// through); keep the two rules in step.
function draftError(inputType: string, draft: string): string | null {
  const text = draft.trim();
  if (!text) return "Enter a value";

  switch (inputType.toUpperCase()) {
    case "INT":
      return /^-?\d+$/.test(text) ? null : "Must be a whole number";
    case "FLOAT":
      return /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(text)
        ? null
        : "Must be a number";
    case "BOOLEAN":
      return /^(true|false)$/i.test(text) ? null : "Must be true or false";
    case "DATE": {
      const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
      return match && isRealDate(+match[1], +match[2], +match[3])
        ? null
        : "Must be a date like 2026-09-27";
    }
    case "DATETIME": {
      const match =
        /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(:\d{2})?$/.exec(text);
      return match &&
        isRealDate(+match[1], +match[2], +match[3]) &&
        +match[4] < 24 &&
        +match[5] < 60
        ? null
        : "Must be a date and time like 2026-09-27T09:30";
    }
    default:
      return null;
  }
}

export {
  aiFieldCount,
  draftError,
  formatSubmittedAt,
  inputKind,
  isAiExtracted,
  replaceField,
  sourceLabel,
};
export type { InputKind };
