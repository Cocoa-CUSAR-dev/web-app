import { QuestionInputType } from "./formEditTypes";

const formEditColumns = [
  "Form",
  "Field",
  "Description",
  "Status",
  "Required",
] as const;

const questionInputTypeNameMap: Record<QuestionInputType, string> = {
  BOOLEAN: "Yes/No Question",
  INT: "Whole Number",
  FLOAT: "Decimal Number",
  OPTION: "Choices",
  VARCHAR: "Text",
  GEODATA: "Geological Data",
};

export { formEditColumns, questionInputTypeNameMap };
