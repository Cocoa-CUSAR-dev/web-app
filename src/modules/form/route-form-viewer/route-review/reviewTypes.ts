import { DefaultResponseType } from "@/core/types";

// US2-8 (docs-and-plan#171/#172): the researcher's review-and-correct
// screen. Shapes mirror web-backend's ResponseReview model.

// Where the chatbot got a value: an AI pulled it out of free text
// ("llm_extracted") or the farmer answered a direct question
// ("guided_flow"). null = the submission didn't come through the chatbot.
type FieldSource = "llm_extracted" | "guided_flow";

type ReviewField = {
  fieldName: string;
  label: string;
  inputType: string;
  value: string | null;
  source: FieldSource | null;
  // Decided by the backend, so this screen doesn't carry its own list of
  // input types a correction can handle.
  editable: boolean;
};

type ReviewSubmission = {
  responseId: string;
  submitter: string;
  // UTC wall-clock, no zone suffix (form.response.submitted_at).
  submittedAt: string | null;
  fields: ReviewField[];
};

type ReviewResponse = DefaultResponseType<ReviewSubmission[]>;

type CorrectFieldRequest = {
  value: string;
  reason?: string;
};

type CorrectFieldResponse = DefaultResponseType<ReviewField>;

export type {
  CorrectFieldRequest,
  CorrectFieldResponse,
  FieldSource,
  ReviewField,
  ReviewResponse,
  ReviewSubmission,
};
