import { describe, expect, it } from "vitest";

import {
  buildColumns,
  buildEdges,
  fieldRows,
} from "@/modules/form/route-data-map/dataMapLayout";

import { catalog, farmActivity } from "../formDefinition/catalogFixture";

describe("Data Map layout", () => {
  it("puts handlers in their category column, children right under the parent", () => {
    const columns = buildColumns(catalog);

    expect(columns.registration.map((n) => n.id)).toEqual([
      "agriculture.farm",
      "agriculture.plot",
    ]);
    expect(columns.garden.map((n) => [n.id, n.depth])).toEqual([
      ["farm_activity", 0],
      ["farm_activity_fertilizer", 1],
    ]);
    expect(columns.cost.map((n) => n.id)).toEqual(["plot_breed"]);
  });

  it("draws foreign keys between cards, not a child's link to its own parent", () => {
    expect(buildEdges(catalog)).toEqual([
      { from: "agriculture.farm", to: "farm_activity" },
      { from: "agriculture.plot", to: "farm_activity" },
      { from: "agriculture.plot", to: "plot_breed" },
    ]);
  });

  it("describes each field in Thai with its usage across the handler's forms", () => {
    const rows = fieldRows(catalog, farmActivity);

    expect(rows.find((r) => r.name === "plot_id")).toEqual({
      name: "plot_id",
      label: "แปลง",
      typeLabel: "ตัวเลือก",
      required: false,
      reference: "แปลง",
      dependsOn: "ฟาร์ม",
      usage: "9/12",
    });
    expect(
      rows.find((r) => r.name === "farm_activity_type_id")?.reference,
    ).toBe("ref.farm_activity_type_constant");
  });
});
