import { DefaultResponseType } from "@/core/types";

interface AnswerRow {
  "Full Name": string;
  Answer: string;
}

type TaskObject = {
  // The hub's `/forms/{id}` takes the form id; a form has one task.
  formId: string;
  taskId: string;
  title: string;
  description: string;
  taskType: string;
  openAt: string;
  closeAt: string;
};

type TasksResponse = DefaultResponseType<TaskObject[]>;

type TaskIdResponse = DefaultResponseType<TaskObject>;

type TaskResponseObject = {
  questionTitle: string;
  answers: AnswerRow[];
};

type TaskResponseResponse = DefaultResponseType<TaskResponseObject>;

export type {
  AnswerRow,
  TaskIdResponse,
  TaskObject,
  TaskResponseResponse,
  TasksResponse,
};
