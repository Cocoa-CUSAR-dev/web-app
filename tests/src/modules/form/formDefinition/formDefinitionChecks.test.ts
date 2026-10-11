import { describe, expect, it } from "vitest";

import {
  fieldChangePatch,
  findDefinitionProblems,
  inputTypeOptions,
  insertQuestionBefore,
  moveQuestionBefore,
  parentQuestion,
  requiredChecklist,
  unmetDependency,
} from "@/modules/form/formDefinition/formDefinitionChecks";

import {
  catalog,
  farmActivity,
  fertilizer,
  plotBreed,
  question,
  section,
} from "./catalogFixture";

const problemsFor = (
  entry: typeof farmActivity,
  sections: ReturnType<typeof section>[],
) =>
  findDefinitionProblems({
    sections,
    handlerFields: entry.fields,
    dependencies: catalog.dependencies,
    registrationParentField: entry.parentField,
    fieldLabels: catalog.fieldLabels,
  });

describe("findDefinitionProblems (mirrors Kotlin FormDefinitionValidator)", () => {
  it("accepts a complete, well-ordered form", () => {
    const sections = [
      section(
        question("farm_id"),
        question("plot_id"),
        question("farm_activity_type_id"),
        question("description", { inputType: "VARCHAR" }),
      ),
    ];

    expect(problemsFor(farmActivity, sections)).toEqual([]);
  });

  it("rejects a missing required column", () => {
    const problems = problemsFor(farmActivity, [section(question("farm_id"))]);

    expect(problems).toEqual([
      expect.objectContaining({
        kind: "missingRequired",
        fields: ["farm_activity_type_id"],
      }),
    ]);
  });

  it("rejects an input type the column can't hold (free text into a uuid)", () => {
    const problems = problemsFor(farmActivity, [
      section(
        question("farm_id"),
        question("farm_activity_type_id", { inputType: "VARCHAR" }),
      ),
    ]);

    expect(problems).toEqual([
      expect.objectContaining({
        kind: "inputType",
        sectionIndex: 0,
        questionIndex: 1,
      }),
    ]);
  });

  it("rejects the same field asked twice", () => {
    const problems = problemsFor(farmActivity, [
      section(
        question("farm_id"),
        question("farm_activity_type_id"),
        question("farm_activity_type_id", { label: "again" }),
      ),
    ]);

    expect(problems.map((p) => p.kind)).toEqual(["duplicate"]);
  });

  it("rejects plot_id with no farm_id question", () => {
    const problems = problemsFor(plotBreed, [
      section(question("plot_id"), question("breed_id")),
    ]);

    expect(problems).toEqual([
      expect.objectContaining({
        kind: "dependency",
        parentField: "farm_id",
        parentPosition: null,
      }),
    ]);
  });

  it("rejects farm_id asked after plot_id, by section then position", () => {
    const problems = problemsFor(farmActivity, [
      section(question("plot_id"), question("farm_activity_type_id")),
      section(question("farm_id")),
    ]);

    expect(problems).toEqual([
      expect.objectContaining({
        kind: "dependency",
        parentPosition: { sectionIndex: 1, questionIndex: 0 },
      }),
    ]);
  });

  it("allows a field that isn't a column (kept in the raw response only)", () => {
    const problems = problemsFor(plotBreed, [
      section(question("farm_id"), question("plot_id"), question("breed_id")),
    ]);

    expect(problems).toEqual([]);
  });

  it("doesn't require a child handler's parent field (the picker supplies it)", () => {
    const problems = problemsFor(fertilizer, [
      section(question("fertilizer_id")),
    ]);

    expect(problems).toEqual([]);
  });

  it("checks nothing until the handler's fields have loaded", () => {
    expect(
      findDefinitionProblems({
        sections: [section(question("plot_id"))],
        handlerFields: null,
        dependencies: catalog.dependencies,
        registrationParentField: null,
      }),
    ).toEqual([]);
  });
});

describe("builder helpers", () => {
  it("lists required columns with whether the form asks them", () => {
    expect(
      requiredChecklist(farmActivity.fields, [section(question("farm_id"))]),
    ).toEqual([
      { name: "farm_id", asked: true },
      { name: "farm_activity_type_id", asked: false },
    ]);
  });

  it("offers only the column's types, or every type for a non-column", () => {
    const all = ["VARCHAR", "INT"] as const;
    expect(inputTypeOptions(farmActivity.fields[4], [...all])).toEqual([
      "VARCHAR",
    ]);
    expect(inputTypeOptions(undefined, [...all])).toEqual(["VARCHAR", "INT"]);
  });

  it("picking a field pre-selects its first allowed type and ticks Required", () => {
    const patch = fieldChangePatch(
      question("", { inputType: "VARCHAR", isMandatory: false }),
      "farm_id",
      farmActivity.fields,
    );

    expect(patch).toEqual({
      fieldName: "farm_id",
      inputType: "OPTION",
      isMandatory: true,
    });
  });

  it("keeps the current type when it already fits", () => {
    expect(
      fieldChangePatch(
        question("", { inputType: "VARCHAR" }),
        "description",
        farmActivity.fields,
      ),
    ).toEqual({ fieldName: "description" });
  });

  it("finds the unmet dependency of a single question", () => {
    const sections = [section(question("plot_id"))];

    expect(
      unmetDependency(
        sections,
        { sectionIndex: 0, questionIndex: 0 },
        catalog.dependencies,
        null,
      )?.dependency.parentField,
    ).toBe("farm_id");
  });

  it("[เพิ่มคำถามฟาร์มให้] inserts a mandatory farm question right above", () => {
    const sections = [section(question("breed_id"), question("plot_id"))];
    const farm = parentQuestion(
      "farm_id",
      plotBreed.fields,
      catalog.fieldLabels,
    );

    const next = insertQuestionBefore(
      sections,
      { sectionIndex: 0, questionIndex: 1 },
      farm,
    );

    expect(next[0].questions.map((q) => q.fieldName)).toEqual([
      "breed_id",
      "farm_id",
      "plot_id",
    ]);
    expect(farm).toMatchObject({
      label: "ฟาร์ม",
      inputType: "OPTION",
      isMandatory: true,
    });
  });

  it("moves a parent from a later section to just above the child", () => {
    const sections = [
      section(question("plot_id"), question("farm_activity_type_id")),
      section(question("farm_id")),
    ];

    const next = moveQuestionBefore(
      sections,
      { sectionIndex: 1, questionIndex: 0 },
      { sectionIndex: 0, questionIndex: 0 },
    );

    expect(next[0].questions.map((q) => q.fieldName)).toEqual([
      "farm_id",
      "plot_id",
      "farm_activity_type_id",
    ]);
    expect(next[1].questions).toEqual([]);
  });

  it("moves a parent up within the same section", () => {
    const sections = [
      section(
        question("description"),
        question("plot_id"),
        question("farm_id"),
      ),
    ];

    const next = moveQuestionBefore(
      sections,
      { sectionIndex: 0, questionIndex: 2 },
      { sectionIndex: 0, questionIndex: 1 },
    );

    expect(next[0].questions.map((q) => q.fieldName)).toEqual([
      "description",
      "farm_id",
      "plot_id",
    ]);
  });
});
