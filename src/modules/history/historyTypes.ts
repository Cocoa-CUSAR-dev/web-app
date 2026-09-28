import { DefaultResponseType } from "@/core/types";

// Mirrors web-backend's Diary.AnswerField (com.cocoa.web.model.Diary).
type AnswerField = {
  fieldName: string;
  label: string;
  inputType: string;
  rawValue: string;
};

// Mirrors web-backend's Diary.Entity.
type DiaryEntry = {
  userId: string;
  entryDate: string;
  diaryText: string;
  updatedAt: string;
};

type SubmissionDaysResponse = DefaultResponseType<string[]>;
type SubmissionAnswersResponse = DefaultResponseType<AnswerField[]>;
type DiaryResponse = DefaultResponseType<DiaryEntry>;

export type {
  AnswerField,
  DiaryEntry,
  DiaryResponse,
  SubmissionAnswersResponse,
  SubmissionDaysResponse,
};
