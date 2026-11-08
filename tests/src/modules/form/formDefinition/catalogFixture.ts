import {
  CatalogEntry,
  CatalogField,
  HandlerCatalog,
} from "@/modules/form/formDefinition/handlerCatalogTypes";
import {
  QuestionInput,
  SectionInput,
} from "@/modules/form/route-form-create/formCreateTypes";

// A slice of the real V30 registry, as GET /forms/handlers/catalog returns it
// on dev: farm_activity (standalone), its child farm_activity_fertilizer,
// plot_breed (no farm_id column), and the plot -> farm dependency.

function field(
  name: string,
  overrides: Partial<CatalogField> = {},
): CatalogField {
  return {
    name,
    dataType: "uuid",
    required: false,
    references: null,
    dependsOn: null,
    allowedInputTypes: ["OPTION"],
    usedByForms: 0,
    ...overrides,
  };
}

const farmActivity: CatalogEntry = {
  handler: "farm_activity",
  labelTh: "กิจกรรมในสวน",
  descriptionTh: "",
  category: "garden",
  frequency: "daily",
  table: "agriculture.farm_activity",
  parentHandler: null,
  parentField: null,
  fields: [
    field("farm_activity_id", { required: false }),
    field("farm_id", {
      required: true,
      references: "agriculture.farm",
      usedByForms: 12,
    }),
    field("plot_id", {
      references: "agriculture.plot",
      dependsOn: "farm_id",
      usedByForms: 9,
    }),
    field("farm_activity_type_id", {
      required: true,
      references: "ref.farm_activity_type_constant",
      usedByForms: 12,
    }),
    field("description", {
      dataType: "VARCHAR",
      allowedInputTypes: ["VARCHAR"],
      usedByForms: 7,
    }),
  ],
  forms: { count: 12, latestTitle: "กิจกรรมประจำวัน", latestOpenAt: null },
  responseCount: 340,
};

const fertilizer: CatalogEntry = {
  ...farmActivity,
  handler: "farm_activity_fertilizer",
  labelTh: "ใส่ปุ๋ย",
  table: "agriculture.farm_activity_fertilizer",
  parentHandler: "farm_activity",
  parentField: "farm_activity_id",
  fields: [
    field("farm_activity_id", { references: "agriculture.farm_activity" }),
    field("fertilizer_id", { required: true }),
  ],
  forms: { count: 1, latestTitle: null, latestOpenAt: null },
  responseCount: 5,
};

const plotBreed: CatalogEntry = {
  ...farmActivity,
  handler: "plot_breed",
  labelTh: "สายพันธุ์ในแปลง",
  category: "plot_info",
  frequency: "once",
  table: "agriculture.plot_breed",
  fields: [
    field("plot_id", {
      required: true,
      references: "agriculture.plot",
      dependsOn: "farm_id",
    }),
    field("breed_id", { required: true, references: "ref.breed_constant" }),
  ],
  forms: { count: 0, latestTitle: null, latestOpenAt: null },
  responseCount: 0,
};

const catalog: HandlerCatalog = {
  handlers: [farmActivity, fertilizer, plotBreed],
  dependencies: [
    {
      childField: "plot_id",
      parentField: "farm_id",
      linkTable: "agriculture.plot",
      linkColumn: "farm_id",
      labelTh: "แปลงต้องอยู่ในฟาร์มที่เลือก",
    },
  ],
  registrationTables: [
    { table: "agriculture.farm", labelTh: "ฟาร์ม" },
    { table: "agriculture.plot", labelTh: "แปลง" },
  ],
  fieldLabels: { farm_id: "ฟาร์ม", plot_id: "แปลง" },
};

function question(
  fieldName: string,
  overrides: Partial<QuestionInput> = {},
): QuestionInput {
  return {
    label: fieldName,
    description: "",
    inputType: "OPTION",
    fieldName,
    isMandatory: true,
    sortOrder: 0,
    ...overrides,
  };
}

function section(...questions: QuestionInput[]): SectionInput {
  return { title: "s", description: "", sortOrder: 0, questions };
}

export { catalog, farmActivity, fertilizer, plotBreed, question, section };
