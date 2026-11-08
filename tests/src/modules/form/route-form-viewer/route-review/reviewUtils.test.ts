import { describe, expect, it } from "vitest";

import type {
  ReviewField,
  ReviewSubmission,
} from "@/modules/form/route-form-viewer/route-review/reviewTypes";
import {
  aiFieldCount,
  draftError,
  formatSubmittedAt,
  inputKind,
  isAiExtracted,
  replaceField,
  sourceLabel,
} from "@/modules/form/route-form-viewer/route-review/reviewUtils";

function field(overrides: Partial<ReviewField> = {}): ReviewField {
  return {
    fieldName: "fan_count",
    label: "Number of fans",
    inputType: "INT",
    value: "5",
    source: "llm_extracted",
    editable: true,
    ...overrides,
  };
}

function submission(
  fields: ReviewField[],
  responseId = "r1",
): ReviewSubmission {
  return {
    responseId,
    submitter: "Somchai Jaidee",
    submittedAt: "2026-09-27T10:00:00",
    fields,
  };
}

describe("source helpers", () => {
  it("recognises AI-extracted fields only", () => {
    expect(isAiExtracted(field({ source: "llm_extracted" }))).toBe(true);
    expect(isAiExtracted(field({ source: "guided_flow" }))).toBe(false);
    expect(isAiExtracted(field({ source: null }))).toBe(false);
  });

  it("counts a submission's AI-extracted fields", () => {
    const s = submission([
      field(),
      field({ fieldName: "a", source: "guided_flow" }),
      field({ fieldName: "b" }),
      field({ fieldName: "c", source: null }),
    ]);

    expect(aiFieldCount(s)).toBe(2);
  });

  it("labels each source, and nothing for a non-chatbot submission", () => {
    expect(sourceLabel("llm_extracted")).toBe("AI-extracted");
    expect(sourceLabel("guided_flow")).toBe("Chatbot");
    expect(sourceLabel(null)).toBeNull();
  });
});

describe("replaceField", () => {
  it("swaps only the corrected field of the matching submission", () => {
    const a = submission(
      [field(), field({ fieldName: "note", value: "x" })],
      "r1",
    );
    const b = submission([field({ value: "9" })], "r2");
    const updated = field({ value: "7" });

    const result = replaceField([a, b], "r1", updated);

    expect(result[0].fields[0]).toEqual(updated);
    expect(result[0].fields[1].value).toBe("x");
    expect(result[1]).toBe(b);
  });

  it("does not mutate its input", () => {
    const a = submission([field()]);

    replaceField([a], "r1", field({ value: "7" }));

    expect(a.fields[0].value).toBe("5");
  });

  it("leaves everything alone when the response is not in the list", () => {
    const a = submission([field()]);

    expect(replaceField([a], "missing", field({ value: "7" }))).toEqual([a]);
  });
});

describe("formatSubmittedAt", () => {
  it("shows the UTC wall-clock time as Asia/Bangkok", () => {
    expect(formatSubmittedAt("2026-09-27T10:00:00")).toBe("2026-09-27 17:00");
  });

  it("rolls over to the next day for a late-evening UTC submission", () => {
    expect(formatSubmittedAt("2026-09-27T17:17:00")).toBe("2026-09-28 00:17");
  });

  it("copes with a missing or unreadable value", () => {
    expect(formatSubmittedAt(null)).toBe("-");
    expect(formatSubmittedAt("not a date")).toBe("not a date");
  });
});

describe("inputKind", () => {
  it("picks the right HTML input for each question type", () => {
    expect(inputKind("INT")).toBe("number");
    expect(inputKind("float")).toBe("number");
    expect(inputKind("DATE")).toBe("date");
    expect(inputKind("DATETIME")).toBe("datetime-local");
    expect(inputKind("BOOLEAN")).toBe("boolean");
    expect(inputKind("VARCHAR")).toBe("text");
  });
});

describe("draftError", () => {
  it("rejects a blank value for every type", () => {
    expect(draftError("VARCHAR", "   ")).toBe("Enter a value");
    expect(draftError("INT", "")).toBe("Enter a value");
  });

  it("accepts any non-blank text for VARCHAR", () => {
    expect(draftError("VARCHAR", "ปุ๋ยคอก")).toBeNull();
  });

  it("INT must be a whole number", () => {
    expect(draftError("INT", "7")).toBeNull();
    expect(draftError("INT", "-3")).toBeNull();
    expect(draftError("INT", "1.5")).not.toBeNull();
    expect(draftError("INT", "ห้า")).not.toBeNull();
  });

  it("FLOAT accepts decimals but not words or odd literals", () => {
    expect(draftError("FLOAT", "12.5")).toBeNull();
    expect(draftError("FLOAT", ".5")).toBeNull();
    expect(draftError("FLOAT", "1e3")).toBeNull();
    expect(draftError("FLOAT", "abc")).not.toBeNull();
    expect(draftError("FLOAT", "0x10")).not.toBeNull();
    expect(draftError("FLOAT", "NaN")).not.toBeNull();
  });

  it("BOOLEAN is true or false in any case", () => {
    expect(draftError("BOOLEAN", "True")).toBeNull();
    expect(draftError("BOOLEAN", "false")).toBeNull();
    expect(draftError("BOOLEAN", "yes")).not.toBeNull();
  });

  it("DATE must be a real ISO date", () => {
    expect(draftError("DATE", "2026-09-27")).toBeNull();
    expect(draftError("DATE", "27/09/2026")).not.toBeNull();
    expect(draftError("DATE", "2026-02-30")).not.toBeNull();
  });

  it("DATETIME takes a T or a space, with or without seconds", () => {
    expect(draftError("DATETIME", "2026-09-27T09:30")).toBeNull();
    expect(draftError("DATETIME", "2026-09-27 09:30:15")).toBeNull();
    expect(draftError("DATETIME", "2026-09-27T25:00")).not.toBeNull();
    expect(draftError("DATETIME", "tomorrow")).not.toBeNull();
  });
});
