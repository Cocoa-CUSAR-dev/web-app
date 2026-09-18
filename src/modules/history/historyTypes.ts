import { DefaultResponseType } from "@/core/types";

// Mirrors web-backend's Diary.AnswerField (com.cocoa.web.model.Diary).
type AnswerField = {
  fieldName: string;
  label: string;
  inputType: string;
  rawValue: string;
};

type SubmissionDaysResponse = DefaultResponseType<string[]>;
type SubmissionAnswersResponse = DefaultResponseType<AnswerField[]>;

export type { AnswerField, SubmissionAnswersResponse, SubmissionDaysResponse };
