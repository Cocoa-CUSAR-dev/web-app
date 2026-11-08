import { DefaultResponseType } from "@/core/types";

import { QuestionInputType } from "../route-form-edit/formEditTypes";

// GET /forms/handlers/catalog (web-backend, US2-13): every active
// form.handler_registry row with its columns and usage counts, the
// form.field_dependency rows, and the tables filled by app registration.

type CatalogField = {
  name: string;
  dataType: string;
  required: boolean;
  references: string | null;
  dependsOn: string | null;
  allowedInputTypes: QuestionInputType[];
  // How many of this handler's forms ask this field.
  usedByForms: number;
};

type HandlerCategory =
  | "garden"
  | "cost"
  | "plot_info"
  | "harvest"
  | "processing";

type HandlerFrequency = "daily" | "per_season" | "yearly" | "once";

type CatalogEntry = {
  handler: string;
  labelTh: string;
  descriptionTh: string;
  category: HandlerCategory;
  frequency: HandlerFrequency;
  // "schema.table"
  table: string;
  parentHandler: string | null;
  // The field the chatbot's parent picker fills (child handlers only).
  parentField: string | null;
  fields: CatalogField[];
  forms: {
    count: number;
    latestTitle: string | null;
    latestOpenAt: string | null;
  };
  responseCount: number;
};

type FieldDependency = {
  childField: string;
  parentField: string;
  linkTable: string;
  linkColumn: string;
  labelTh: string;
};

type RegistrationTable = {
  table: string;
  labelTh: string;
};

type HandlerCatalog = {
  handlers: CatalogEntry[];
  dependencies: FieldDependency[];
  registrationTables: RegistrationTable[];
  // field_name -> the label researchers most often give it.
  fieldLabels: Record<string, string>;
};

type HandlerCatalogResponse = DefaultResponseType<HandlerCatalog>;

export type {
  CatalogEntry,
  CatalogField,
  FieldDependency,
  HandlerCatalog,
  HandlerCatalogResponse,
  HandlerCategory,
  HandlerFrequency,
  RegistrationTable,
};
