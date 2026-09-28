import { DefaultResponseType } from "@/core/types";

// ROLE = everyone holding that role, USER = one person.
type RecipientType = "ROLE" | "USER";

type ReminderRecipient = {
  type: RecipientType;
  id: string;
  label: string;
};

// What the settings form edits. Empty recipients = everyone who still owes
// the task.
type ReminderValue = {
  enabled: boolean;
  timeOfDay: string;
  recipients: ReminderRecipient[];
};

// What is sent to the backend (labels are display-only, not sent).
type ReminderRequest = {
  enabled: boolean;
  timeOfDay: string;
  recipients: { type: RecipientType; id: string }[];
};

type ReminderDetail = {
  scheduleId: string | null;
  enabled: boolean;
  timeOfDay: string | null;
  recipients: ReminderRecipient[];
};

type RoleOption = {
  roleId: string;
  roleName: string;
};

type UserOption = {
  userId: string;
  username: string;
  roles: string[];
};

type ReminderDetailResponse = DefaultResponseType<ReminderDetail>;
type RoleOptionsResponse = DefaultResponseType<RoleOption[]>;
type UserOptionsResponse = DefaultResponseType<UserOption[]>;

export type {
  RecipientType,
  ReminderDetail,
  ReminderDetailResponse,
  ReminderRecipient,
  ReminderRequest,
  ReminderValue,
  RoleOption,
  RoleOptionsResponse,
  UserOption,
  UserOptionsResponse,
};
