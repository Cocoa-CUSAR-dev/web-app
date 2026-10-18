import {
  HandlerField,
  QuestionInput,
  SectionInput,
} from "../route-form-create/formCreateTypes";
import { QuestionInputType } from "../route-form-edit/formEditTypes";
import { FieldDependency } from "./handlerCatalogTypes";

// US2-13: the builder-side copy of web-backend's FormDefinitionValidator.
// Kotlin stays the authority (it rejects the save either way); this copy is
// here so the researcher sees each problem next to the question that causes
// it while building, instead of only after pressing save.

type QuestionPosition = { sectionIndex: number; questionIndex: number };

type DefinitionProblem =
  | ({ kind: "inputType"; message: string } & QuestionPosition)
  | { kind: "duplicate"; fieldName: string; message: string }
  | { kind: "missingRequired"; fields: string[]; message: string }
  | ({
      kind: "dependency";
      parentField: string;
      // Where the parent question is, if the form has one (after the child).
      parentPosition: QuestionPosition | null;
      message: string;
    } & QuestionPosition);

function fieldLabel(
  fieldName: string,
  fieldLabels: Record<string, string> | undefined,
): string {
  return fieldLabels?.[fieldName] ?? fieldName;
}

function askedQuestions(sections: SectionInput[]) {
  return sections.flatMap((section, sectionIndex) =>
    section.questions
      .map((question, questionIndex) => ({
        question,
        sectionIndex,
        questionIndex,
      }))
      .filter(({ question }) => Boolean(question.fieldName?.trim())),
  );
}

function isBefore(a: QuestionPosition, b: QuestionPosition): boolean {
  return (
    a.sectionIndex < b.sectionIndex ||
    (a.sectionIndex === b.sectionIndex && a.questionIndex < b.questionIndex)
  );
}

// The dependency this question breaks, if any: it asks a dependent field
// (plot_id) but the form doesn't ask the parent (farm_id) before it. A parent
// the chatbot's picker supplies (the handler's parentField) always counts as
// asked first.
function unmetDependency(
  sections: SectionInput[],
  position: QuestionPosition,
  dependencies: FieldDependency[],
  registrationParentField: string | null,
): {
  dependency: FieldDependency;
  parentPosition: QuestionPosition | null;
} | null {
  const question =
    sections[position.sectionIndex]?.questions[position.questionIndex];
  const fieldName = question?.fieldName?.trim();
  if (!fieldName) return null;
  const dependency = dependencies.find((d) => d.childField === fieldName);
  if (!dependency || dependency.parentField === registrationParentField) {
    return null;
  }
  const parent = askedQuestions(sections).find(
    ({ question: q }) => q.fieldName?.trim() === dependency.parentField,
  );
  if (parent && isBefore(parent, position)) return null;
  return {
    dependency,
    parentPosition: parent
      ? {
          sectionIndex: parent.sectionIndex,
          questionIndex: parent.questionIndex,
        }
      : null,
  };
}

// Same rules, same order as Kotlin's FormDefinitionValidator: inputType must
// fit the column, each field at most once, every required column asked, and
// every dependent field after its parent. A field_name that isn't a column of
// this table is allowed (its answer stays in form.response only).
function findDefinitionProblems({
  sections,
  handlerFields,
  dependencies,
  registrationParentField,
  fieldLabels,
}: {
  sections: SectionInput[];
  handlerFields: HandlerField[] | null;
  dependencies: FieldDependency[];
  registrationParentField: string | null;
  fieldLabels?: Record<string, string>;
}): DefinitionProblem[] {
  if (!handlerFields) return [];
  const problems: DefinitionProblem[] = [];
  const fieldByName = new Map(handlerFields.map((f) => [f.name, f]));
  const asked = askedQuestions(sections);

  asked.forEach(({ question, sectionIndex, questionIndex }) => {
    const field = fieldByName.get(question.fieldName!.trim());
    if (!field?.allowedInputTypes) return;
    if (!field.allowedInputTypes.includes(question.inputType)) {
      const allowed = field.allowedInputTypes.join(" / ") || "-";
      problems.push({
        kind: "inputType",
        sectionIndex,
        questionIndex,
        message: `คำถาม '${question.label}' (${field.name}) ใช้ชนิด ${question.inputType} ไม่ได้ คอลัมน์นี้รับได้เฉพาะ ${allowed}`,
      });
    }
  });

  const byField = new Map<string, QuestionInput[]>();
  asked.forEach(({ question }) => {
    const name = question.fieldName!.trim();
    byField.set(name, [...(byField.get(name) ?? []), question]);
  });
  byField.forEach((questions, fieldName) => {
    if (questions.length < 2) return;
    const labels = questions.map((q) => `'${q.label}'`).join(", ");
    problems.push({
      kind: "duplicate",
      fieldName,
      message: `ฟิลด์ ${fieldName} ถูกใช้ซ้ำ ${questions.length} คำถาม (${labels}) ต้องมีได้คำถามเดียว`,
    });
  });

  const missing = requiredChecklist(handlerFields, sections)
    .filter((item) => !item.asked)
    .map((item) => item.name);
  if (missing.length > 0) {
    problems.push({
      kind: "missingRequired",
      fields: missing,
      message: `ตารางนี้บังคับฟิลด์ ${missing.join(", ")} แต่ฟอร์มยังไม่มีคำถามสำหรับฟิลด์นี้`,
    });
  }

  asked.forEach(({ question, sectionIndex, questionIndex }) => {
    const unmet = unmetDependency(
      sections,
      { sectionIndex, questionIndex },
      dependencies,
      registrationParentField,
    );
    if (!unmet) return;
    const parentLabel = fieldLabel(unmet.dependency.parentField, fieldLabels);
    problems.push({
      kind: "dependency",
      sectionIndex,
      questionIndex,
      parentField: unmet.dependency.parentField,
      parentPosition: unmet.parentPosition,
      message: `คำถาม '${question.label}' (${question.fieldName}) ต้องมีคำถาม '${parentLabel}' (${unmet.dependency.parentField}) อยู่ก่อน (${unmet.dependency.labelTh})`,
    });
  });

  return problems;
}

// "ฟิลด์ที่ตารางนี้บังคับ: farm_id ✔ / hub_id ✘"
function requiredChecklist(
  handlerFields: HandlerField[] | null,
  sections: SectionInput[],
): { name: string; asked: boolean }[] {
  const asked = new Set(
    askedQuestions(sections).map(({ question }) => question.fieldName!.trim()),
  );
  return (handlerFields ?? [])
    .filter((field) => field.required)
    .map((field) => ({ name: field.name, asked: asked.has(field.name) }));
}

// The input types the builder offers for a field. A column offers only what
// it can hold; a field that isn't a column of this table (or a table the API
// couldn't describe) offers everything, as before.
function inputTypeOptions(
  field: HandlerField | undefined,
  allTypes: QuestionInputType[],
): QuestionInputType[] {
  const allowed = field?.allowedInputTypes;
  return allowed && allowed.length > 0 ? allowed : allTypes;
}

// Picking a field pre-selects the first type its column allows, unless the
// question's current type already fits. A required column also ticks
// "Required": a skipped answer would fail the INSERT anyway.
function fieldChangePatch(
  question: QuestionInput,
  fieldName: string,
  handlerFields: HandlerField[] | null,
): Partial<QuestionInput> {
  const field = handlerFields?.find((f) => f.name === fieldName);
  const allowed = field?.allowedInputTypes ?? [];
  const patch: Partial<QuestionInput> = { fieldName };
  if (allowed.length > 0 && !allowed.includes(question.inputType)) {
    patch.inputType = allowed[0];
  }
  if (field?.required) patch.isMandatory = true;
  return patch;
}

// The question the one-click [เพิ่มคำถาม…ให้] inserts for a missing parent.
// The parent needn't be a column of this table (plot_breed has no farm_id):
// then it's OPTION, used only to filter the child's choices.
function parentQuestion(
  parentField: string,
  handlerFields: HandlerField[] | null,
  fieldLabels: Record<string, string> | undefined,
): QuestionInput {
  const field = handlerFields?.find((f) => f.name === parentField);
  return {
    label: fieldLabel(parentField, fieldLabels),
    description: "",
    inputType: field?.allowedInputTypes?.[0] ?? "OPTION",
    fieldName: parentField,
    isMandatory: true,
    carryForward: false,
    sortOrder: 0,
  };
}

function insertQuestionBefore(
  sections: SectionInput[],
  position: QuestionPosition,
  question: QuestionInput,
): SectionInput[] {
  return sections.map((section, sectionIndex) =>
    sectionIndex === position.sectionIndex
      ? {
          ...section,
          questions: [
            ...section.questions.slice(0, position.questionIndex),
            question,
            ...section.questions.slice(position.questionIndex),
          ],
        }
      : section,
  );
}

// Moves the question at `from` to just before the one at `to` (the parent
// that sits after its child goes up to right above the child).
function moveQuestionBefore(
  sections: SectionInput[],
  from: QuestionPosition,
  to: QuestionPosition,
): SectionInput[] {
  const moving = sections[from.sectionIndex]?.questions[from.questionIndex];
  if (!moving) return sections;
  const without = sections.map((section, sectionIndex) =>
    sectionIndex === from.sectionIndex
      ? {
          ...section,
          questions: section.questions.filter(
            (_, questionIndex) => questionIndex !== from.questionIndex,
          ),
        }
      : section,
  );
  const target =
    from.sectionIndex === to.sectionIndex &&
    from.questionIndex < to.questionIndex
      ? { ...to, questionIndex: to.questionIndex - 1 }
      : to;
  return insertQuestionBefore(without, target, moving);
}

// Adds a question for a required field at the end of the last section.
function appendQuestion(
  sections: SectionInput[],
  question: QuestionInput,
): SectionInput[] {
  if (sections.length === 0) return sections;
  const last = sections.length - 1;
  return sections.map((section, sectionIndex) =>
    sectionIndex === last
      ? { ...section, questions: [...section.questions, question] }
      : section,
  );
}

// Picking a handler on Create starts the form with a question for every
// required field, so a researcher never has to discover them one by one. A
// required field that depends on another (plot_id on farm_id) gets its parent
// question first. The untouched blank question a new form starts with is
// replaced; otherwise (e.g. a duplicated form) the questions are appended.
function withRequiredQuestions({
  sections,
  handlerFields,
  dependencies,
  registrationParentField,
  fieldLabels,
}: {
  sections: SectionInput[];
  handlerFields: HandlerField[];
  dependencies: FieldDependency[];
  registrationParentField: string | null;
  fieldLabels?: Record<string, string>;
}): SectionInput[] {
  const asked = new Set(
    askedQuestions(sections).map(({ question }) => question.fieldName!.trim()),
  );
  const toAdd: string[] = [];
  requiredChecklist(handlerFields, sections)
    .filter((item) => !item.asked)
    .forEach(({ name }) => {
      const parent = dependencies.find(
        (d) => d.childField === name,
      )?.parentField;
      if (
        parent &&
        parent !== registrationParentField &&
        !asked.has(parent) &&
        !toAdd.includes(parent)
      ) {
        toAdd.push(parent);
      }
      if (!toAdd.includes(name)) toAdd.push(name);
    });
  if (toAdd.length === 0 || sections.length === 0) return sections;

  const questions = toAdd.map((name) =>
    parentQuestion(name, handlerFields, fieldLabels),
  );
  const isBlank = (q: QuestionInput) =>
    !q.label.trim() && !q.fieldName?.trim() && !q.description?.trim();
  if (sections.length === 1 && sections[0].questions.every(isBlank)) {
    return [{ ...sections[0], questions }];
  }
  return questions.reduce(appendQuestion, sections);
}

export type { DefinitionProblem, QuestionPosition };
export {
  appendQuestion,
  fieldChangePatch,
  fieldLabel,
  findDefinitionProblems,
  inputTypeOptions,
  insertQuestionBefore,
  moveQuestionBefore,
  parentQuestion,
  requiredChecklist,
  unmetDependency,
  withRequiredQuestions,
};
