import { describe, expect, it } from "vitest";

import { getRandomNumberArray } from "@/stubs/libs/getRandomNumberArray";

describe("getRandomNumberArray", () => {
  it("returns an array of the requested length", async () => {
    const result = await getRandomNumberArray(5);

    expect(result).toHaveLength(5);
  });

  it("returns an empty array for a count of zero", async () => {
    expect(await getRandomNumberArray(0)).toEqual([]);
  });

  it("returns an empty array for a negative count", async () => {
    expect(await getRandomNumberArray(-3)).toEqual([]);
  });

  it("returns integers between 0 and 99 inclusive", async () => {
    const result = await getRandomNumberArray(50);

    for (const value of result) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(100);
    }
  });
});
