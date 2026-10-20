import { DefaultResponseType } from "@/core/types";

import { ReminderRequest } from "../reminder/reminderTypes";
import { Form, QuestionInputType } from "../route-form-edit/formEditTypes";

type QuestionInput = {
  questionId?: string;
  label: string;
  description: string | null;
  inputType: QuestionInputType;
  fieldName: string | null;
  isMandatory: boolean;
  // Only acted on for multi-submit forms: the chatbot reuses this answer
  // from the previous submission when the farmer adds another row.
  carryForward?: boolean;
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

type ReminderInput = ReminderRequest;

type CreateFormRequest = {
  title: string;
  description: string | null;
  taskType?: string;
  openAt: string;
  closeAt: string;
  handler: string;
  isMultipleSubmit: boolean;
  sections: SectionInput[];
  reminder?: ReminderInput;
};

type UpdateFormRequest = {
  description: string | null;
  isMultipleSubmit: boolean;
  sections: SectionInput[];
};

type CreateFormResponse = DefaultResponseType<Form>;
type UpdateFormResponse = DefaultResponseType<Form>;

type HandlersResponse = DefaultResponseType<string[]>;

// One column of the handler's table. Everything after dataType was added by
// US2-13 so the builder can't produce a form that can never be saved:
// required = the INSERT fails without it; allowedInputTypes = what the
// column can hold, first one being the default; dependsOn = the field whose
// answer filters this one's choices (plot_id -> farm_id).
type HandlerField = {
  name: string;
  dataType: string;
  required?: boolean;
  references?: string | null;
  dependsOn?: string | null;
  allowedInputTypes?: QuestionInputType[];
};

type HandlerFieldsResponse = DefaultResponseType<HandlerField[]>;

export type {
  CreateFormRequest,
  CreateFormResponse,
  HandlerField,
  HandlerFieldsResponse,
  HandlersResponse,
  QuestionInput,
  ReminderInput,
  SectionInput,
  UpdateFormRequest,
  UpdateFormResponse,
};
