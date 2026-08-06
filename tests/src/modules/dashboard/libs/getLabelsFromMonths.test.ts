import { describe, expect, it } from "vitest";

import { getLabelsFromMonths } from "@/modules/dashboard/libs/getLabelsFromMonths";

describe("getLabelsFromMonths", () => {
  it("returns a single label when from and to are the same month", () => {
    expect(getLabelsFromMonths(3, 2024, 3, 2024)).toEqual(["Mar"]);
  });

  it("returns consecutive month labels within a single year", () => {
    expect(getLabelsFromMonths(1, 2024, 4, 2024)).toEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
    ]);
  });

  it("spans across a year boundary", () => {
    expect(getLabelsFromMonths(11, 2023, 2, 2024)).toEqual([
      "Nov",
      "Dec",
      "Jan",
      "Feb",
    ]);
  });

  it("returns a full 12-month year", () => {
    expect(getLabelsFromMonths(1, 2024, 12, 2024)).toHaveLength(12);
  });

  it("returns an empty array when the range is inverted", () => {
    expect(getLabelsFromMonths(6, 2024, 1, 2024)).toEqual([]);
  });
});
