import { DefaultResponseType } from "@/core/types";

import { Form, QuestionInputType } from "../route-form-edit/formEditTypes";

type QuestionInput = {
  questionId?: string;
  label: string;
  description: string | null;
  inputType: QuestionInputType;
  fieldName: string | null;
  isMandatory: boolean;
  sortOrder: number;
  defaultValue?: unknown;
};

type SectionInput = {
  sectionId?: string;
  title: string;
  description: string | null;
  isActive?: boolean;
  sortOrder: number;
  questions: QuestionInput[];
};

type CreateFormRequest = {
  title: string;
  description: string | null;
  taskType?: string;
  openAt: string;
  closeAt: string;
  handler: string;
  sections: SectionInput[];
};

type UpdateFormRequest = {
  description: string | null;
  sections: SectionInput[];
};

type CreateFormResponse = DefaultResponseType<Form>;
type UpdateFormResponse = DefaultResponseType<Form>;

type HandlersResponse = DefaultResponseType<string[]>;

type HandlerField = {
  name: string;
  dataType: string;
};

type HandlerFieldsResponse = DefaultResponseType<HandlerField[]>;

export type {
  CreateFormRequest,
  CreateFormResponse,
  HandlerField,
  HandlerFieldsResponse,
  HandlersResponse,
  QuestionInput,
  SectionInput,
  UpdateFormRequest,
  UpdateFormResponse,
};
