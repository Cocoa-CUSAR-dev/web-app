import { DefaultResponseType } from "@/core/types";

import { formEditColumns } from "./formEditConstants";

type QuestionInputType =
  | "BOOLEAN"
  | "INT"
  | "FLOAT"
  | "OPTION"
  | "VARCHAR"
  | "GEODATA"
  | "DATE"
  | "DATETIME";

type Choice = {
  id: string;
  name: string;
};

type Question = {
  questionId: string;
  sectionId: string;
  label: string;
  fieldName: string;
  description: string | null;
  inputType: QuestionInputType;
  isMandatory: boolean;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  choices: Choice[] | null;
};

type Section = {
  sectionId: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  questions: Question[];
};

type Form = {
  formId: string;
  title: string;
  description: string | null;
  sections: Section[];
};

type GetFormsResponse = DefaultResponseType<
  (Pick<Form, "formId" | "title" | "description"> & {
    taskId: string;
    content: string;
    handler: string;
    isMultipleSubmit: boolean;
    createdAt: string;
  })[]
>;

type FormEditRequest = {
  sections: {
    sectionId: string;
    isActive: boolean;
    questions: {
      questionId: string;
      isActive: boolean;
      isMandatory: boolean;
    }[];
  }[];
};

type GetFormIdResponse = DefaultResponseType<Form>;

type FormEditColumn = (typeof formEditColumns)[number];

type FormEditColumnSchema = {
  Form: string;
  Field: string;
  Description: string | null;
  Status: boolean;
  Required: boolean;
  Choices: Choice[] | null;
};

type FormEditRow = {
  [k in FormEditColumn]: FormEditColumnSchema[k];
} & {
  Choices: FormEditColumnSchema["Choices"];
};

export type {
  Choice,
  Form,
  FormEditColumn,
  FormEditRequest,
  FormEditRow,
  GetFormIdResponse,
  GetFormsResponse,
  QuestionInputType,
  Section,
};
