import {
  CatalogEntry,
  CatalogField,
  HandlerCatalog,
  HandlerCategory,
  HandlerFrequency,
  RegistrationTable,
} from "../formDefinition/handlerCatalogTypes";
import { QuestionInputType } from "../route-form-edit/formEditTypes";

// US2-13 Data Map (doc §3.4): columns left -> right in the order data is
// created, registration first.

type ColumnKey = "registration" | "cost" | "garden" | "harvest" | "processing";

const dataMapColumns: {
  key: ColumnKey;
  title: string;
  categories: HandlerCategory[];
}[] = [
  { key: "registration", title: "ลงทะเบียน (ผ่านแอป)", categories: [] },
  {
    key: "cost",
    title: "ต้นทุน/ข้อมูลแปลง",
    categories: ["cost", "plot_info"],
  },
  { key: "garden", title: "สวน", categories: ["garden"] },
  { key: "harvest", title: "เก็บเกี่ยว", categories: ["harvest"] },
  { key: "processing", title: "แปรรูป", categories: ["processing"] },
];

const frequencyLabels: Record<HandlerFrequency, string> = {
  daily: "ประจำวัน",
  per_season: "รายฤดู",
  yearly: "รายปี",
  once: "ครั้งเดียว",
};

const inputTypeLabels: Record<QuestionInputType, string> = {
  OPTION: "ตัวเลือก",
  VARCHAR: "ข้อความ",
  INT: "จำนวนเต็ม",
  FLOAT: "ตัวเลข",
  BOOLEAN: "ใช่/ไม่ใช่",
  DATE: "วันที่",
  DATETIME: "วันและเวลา",
  GEODATA: "พิกัด",
};

type DataMapNode =
  | { id: string; kind: "handler"; depth: 0 | 1; entry: CatalogEntry }
  | { id: string; kind: "registration"; depth: 0; table: RegistrationTable };

type DataMapEdge = { from: string; to: string };

function columnOf(entry: CatalogEntry): ColumnKey {
  return (
    dataMapColumns.find((column) => column.categories.includes(entry.category))
      ?.key ?? "garden"
  );
}

// Each column's cards, child handlers listed right under their parent.
function buildColumns(
  catalog: HandlerCatalog,
): Record<ColumnKey, DataMapNode[]> {
  const columns: Record<ColumnKey, DataMapNode[]> = {
    registration: catalog.registrationTables.map((table) => ({
      id: table.table,
      kind: "registration",
      depth: 0,
      table,
    })),
    cost: [],
    garden: [],
    harvest: [],
    processing: [],
  };
  const byHandler = new Map(catalog.handlers.map((h) => [h.handler, h]));
  const isNestedChild = (entry: CatalogEntry) => {
    const parent = entry.parentHandler && byHandler.get(entry.parentHandler);
    return Boolean(parent && columnOf(parent) === columnOf(entry));
  };
  catalog.handlers
    .filter((entry) => !isNestedChild(entry))
    .forEach((entry) => {
      const column = columns[columnOf(entry)];
      column.push({ id: entry.handler, kind: "handler", depth: 0, entry });
      catalog.handlers
        .filter(
          (child) =>
            child.parentHandler === entry.handler && isNestedChild(child),
        )
        .forEach((child) =>
          column.push({
            id: child.handler,
            kind: "handler",
            depth: 1,
            entry: child,
          }),
        );
    });
  return columns;
}

// The card a "schema.table" belongs to: a registration table or a handler.
function nodeIdForTable(catalog: HandlerCatalog, table: string): string | null {
  if (catalog.registrationTables.some((r) => r.table === table)) return table;
  return catalog.handlers.find((h) => h.table === table)?.handler ?? null;
}

// Arrows = foreign keys between cards (farm -> farm_activity, harvest ->
// batch). A child's link to its parent is already shown by nesting it.
function buildEdges(catalog: HandlerCatalog): DataMapEdge[] {
  const seen = new Set<string>();
  const edges: DataMapEdge[] = [];
  catalog.handlers.forEach((entry) => {
    entry.fields.forEach((field) => {
      if (!field.references) return;
      const from = nodeIdForTable(catalog, field.references);
      if (!from || from === entry.handler || from === entry.parentHandler) {
        return;
      }
      const key = `${from}->${entry.handler}`;
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ from, to: entry.handler });
    });
  });
  return edges;
}

function referenceLabel(
  catalog: HandlerCatalog,
  table: string | null,
): string | null {
  if (!table) return null;
  const registration = catalog.registrationTables.find(
    (r) => r.table === table,
  );
  if (registration) return registration.labelTh;
  const handler = catalog.handlers.find((h) => h.table === table);
  return handler?.labelTh ?? table;
}

type FieldRow = {
  name: string;
  label: string | null;
  typeLabel: string;
  required: boolean;
  reference: string | null;
  dependsOn: string | null;
  usage: string;
};

// View 2's table: one row per column of the handler's table.
function fieldRows(catalog: HandlerCatalog, entry: CatalogEntry): FieldRow[] {
  return entry.fields.map((field: CatalogField) => {
    const firstType = field.allowedInputTypes[0];
    return {
      name: field.name,
      label: catalog.fieldLabels[field.name] ?? null,
      typeLabel: firstType ? inputTypeLabels[firstType] : field.dataType,
      required: field.required,
      reference: referenceLabel(catalog, field.references),
      dependsOn: field.dependsOn
        ? (catalog.fieldLabels[field.dependsOn] ?? field.dependsOn)
        : null,
      usage: `${field.usedByForms}/${entry.forms.count}`,
    };
  });
}

export type { ColumnKey, DataMapEdge, DataMapNode, FieldRow };
export {
  buildColumns,
  buildEdges,
  dataMapColumns,
  fieldRows,
  frequencyLabels,
  inputTypeLabels,
  referenceLabel,
};
