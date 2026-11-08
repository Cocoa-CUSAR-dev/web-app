import { describe, expect, it } from "vitest";

import { buildFieldMap } from "@/modules/form/formDefinition/fieldMap";
import { Section } from "@/modules/form/route-form-edit/formEditTypes";

import { catalog, farmActivity, plotBreed } from "./catalogFixture";

function savedSection(
  sortOrder: number,
  questions: [string, string | null, Section["questions"][0]["inputType"]][],
  isActive = true,
): Section {
  return {
    sectionId: `s${sortOrder}`,
    title: "s",
    description: null,
    sortOrder,
    isActive,
    questions: questions.map(([label, fieldName, inputType], index) => ({
      questionId: `s${sortOrder}q${index}`,
      sectionId: `s${sortOrder}`,
      label,
      fieldName: fieldName as string,
      description: null,
      inputType,
      isMandatory: true,
      isDefault: false,
      isActive: true,
      sortOrder: index,
      choices: null,
    })),
  };
}

const build = (entry: typeof farmActivity, sections: Section[]) =>
  buildFieldMap({
    sections,
    entry,
    dependencies: catalog.dependencies,
    fieldLabels: catalog.fieldLabels,
  });

describe("buildFieldMap (ข้อมูลไปลงที่ไหน)", () => {
  it("points each column question at its table column", () => {
    const map = build(farmActivity, [
      savedSection(0, [
        ["ฟาร์มที่ทำกิจกรรม", "farm_id", "OPTION"],
        ["แปลงที่ดำเนินการ", "plot_id", "OPTION"],
        ["กิจกรรมที่ทำ", "farm_activity_type_id", "OPTION"],
      ]),
    ]);

    expect(map.missingRequired).toEqual([]);
    expect(map.rows.map((r) => r.target)).toEqual([
      "agriculture.farm_activity.farm_id",
      "agriculture.farm_activity.plot_id",
      "agriculture.farm_activity.farm_activity_type_id",
    ]);
    expect(map.rows[1].notes).toEqual([
      { severity: "info", text: "ขึ้นกับคำถาม 'ฟาร์มที่ทำกิจกรรม'" },
    ]);
  });

  it("flags a mis-named field: its answer never reaches the table", () => {
    const map = build(farmActivity, [
      savedSection(0, [
        ["ฟาร์ม", "farm_id", "OPTION"],
        ["กิจกรรม", "farm_activity_type_id", "OPTION"],
        ["หมายเหตุ", "notes", "VARCHAR"],
      ]),
    ]);

    expect(map.rows[2]).toMatchObject({
      target: null,
      notes: [
        {
          severity: "warning",
          text: "ไม่ตรงกับคอลัมน์ใด: เก็บเฉพาะในคำตอบดิบ ไม่ลงตาราง",
        },
      ],
    });
  });

  it("flags a missing required field and a missing parent", () => {
    const map = build(farmActivity, [
      savedSection(0, [["แปลง", "plot_id", "OPTION"]]),
    ]);

    expect(map.missingRequired).toEqual(["farm_id", "farm_activity_type_id"]);
    expect(map.rows[0].notes).toEqual([
      expect.objectContaining({ severity: "error" }),
    ]);
  });

  it("calls plot_breed's farm question 'used for filtering', not a mistake", () => {
    const map = build(plotBreed, [
      savedSection(0, [
        ["ฟาร์ม", "farm_id", "OPTION"],
        ["แปลง", "plot_id", "OPTION"],
        ["สายพันธุ์", "breed_id", "OPTION"],
      ]),
    ]);

    expect(map.rows[0].notes).toEqual([
      { severity: "info", text: "ใช้กรอง ไม่บันทึกลงตาราง" },
    ]);
  });

  it("flags a wrong input type and a question with no field", () => {
    const map = build(farmActivity, [
      savedSection(0, [
        ["ฟาร์ม", "farm_id", "OPTION"],
        ["กิจกรรม", "farm_activity_type_id", "VARCHAR"],
        ["ไม่มีฟิลด์", null, "VARCHAR"],
      ]),
    ]);

    expect(map.rows[1].notes[0].severity).toBe("error");
    expect(map.rows[2].notes[0].text).toContain("ไม่มีชื่อฟิลด์");
  });

  it("ignores inactive sections, the way farmers never see them", () => {
    const map = build(farmActivity, [
      savedSection(0, [
        ["ฟาร์ม", "farm_id", "OPTION"],
        ["กิจกรรม", "farm_activity_type_id", "OPTION"],
      ]),
      savedSection(1, [["ซ่อน", "notes", "VARCHAR"]], false),
    ]);

    expect(map.rows).toHaveLength(2);
  });
});
