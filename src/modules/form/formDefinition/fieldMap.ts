import { Section } from "../route-form-edit/formEditTypes";
import { CatalogEntry, FieldDependency } from "./handlerCatalogTypes";

// US2-13 "ข้อมูลไปลงที่ไหน" (doc §3.4 view 3): for each question of a saved
// form, which column its answer is inserted into -- or why it isn't. Go's
// dissection silently drops an answer whose field_name isn't a column; this
// is where that becomes visible.

type FieldMapNote = {
  severity: "error" | "warning" | "info";
  text: string;
};

type FieldMapRow = {
  questionId: string;
  label: string;
  fieldName: string | null;
  // "schema.table.column" the answer is inserted into, or null.
  target: string | null;
  notes: FieldMapNote[];
};

type FieldMap = {
  rows: FieldMapRow[];
  // Required columns no question asks: every submission will fail.
  missingRequired: string[];
};

function buildFieldMap({
  sections,
  entry,
  dependencies,
  fieldLabels,
}: {
  sections: Section[];
  entry: CatalogEntry | undefined;
  dependencies: FieldDependency[];
  fieldLabels: Record<string, string>;
}): FieldMap {
  const questions = [...sections]
    .filter((section) => section.isActive !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((section) =>
      [...section.questions]
        .filter((question) => question.isActive !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  const columns = new Map((entry?.fields ?? []).map((f) => [f.name, f]));
  const askedOrder = questions
    .map((q) => q.fieldName?.trim())
    .filter((name): name is string => Boolean(name));
  const countOf = (name: string) =>
    askedOrder.filter((asked) => asked === name).length;
  const labelOf = (name: string) =>
    questions.find((q) => q.fieldName?.trim() === name)?.label ??
    fieldLabels[name] ??
    name;
  // Fields asked only so another question's choices can be filtered.
  const filterParents = new Set(
    dependencies
      .filter((d) => askedOrder.includes(d.childField))
      .map((d) => d.parentField),
  );

  const rows = questions.map((question, index): FieldMapRow => {
    const fieldName = question.fieldName?.trim() || null;
    const notes: FieldMapNote[] = [];
    if (!fieldName) {
      notes.push({
        severity: "warning",
        text: "ไม่มีชื่อฟิลด์: เก็บเฉพาะในคำตอบดิบ ไม่ลงตาราง",
      });
      return {
        questionId: question.questionId,
        label: question.label,
        fieldName,
        target: null,
        notes,
      };
    }

    const column = entry ? columns.get(fieldName) : undefined;
    if (entry && !column) {
      notes.push(
        filterParents.has(fieldName)
          ? { severity: "info", text: "ใช้กรอง ไม่บันทึกลงตาราง" }
          : {
              severity: "warning",
              text: "ไม่ตรงกับคอลัมน์ใด: เก็บเฉพาะในคำตอบดิบ ไม่ลงตาราง",
            },
      );
    }
    if (column && !column.allowedInputTypes.includes(question.inputType)) {
      notes.push({
        severity: "error",
        text: `ชนิด ${question.inputType} ใส่คอลัมน์นี้ไม่ได้ (รับได้เฉพาะ ${column.allowedInputTypes.join(" / ") || "-"})`,
      });
    }
    if (countOf(fieldName) > 1) {
      notes.push({
        severity: "warning",
        text: "ฟิลด์นี้ถูกถามซ้ำ คำตอบหลังสุดจะทับคำตอบก่อนหน้า",
      });
    }

    const dependency = dependencies.find((d) => d.childField === fieldName);
    if (dependency && dependency.parentField !== entry?.parentField) {
      const parentIndex = askedOrder.indexOf(dependency.parentField);
      const ownIndex = questions
        .slice(0, index)
        .filter((q) => q.fieldName?.trim()).length;
      const parentLabel = labelOf(dependency.parentField);
      notes.push(
        parentIndex >= 0 && parentIndex < ownIndex
          ? { severity: "info", text: `ขึ้นกับคำถาม '${parentLabel}'` }
          : {
              severity: "error",
              text: `ขึ้นกับคำถาม '${parentLabel}' แต่ฟอร์มไม่มีคำถามนี้อยู่ก่อน`,
            },
      );
    }

    return {
      questionId: question.questionId,
      label: question.label,
      fieldName,
      target: column && entry ? `${entry.table}.${fieldName}` : null,
      notes,
    };
  });

  const missingRequired = (entry?.fields ?? [])
    .filter((field) => field.required && !askedOrder.includes(field.name))
    .map((field) => field.name);

  return { rows, missingRequired };
}

export type { FieldMap, FieldMapNote, FieldMapRow };
export { buildFieldMap };
