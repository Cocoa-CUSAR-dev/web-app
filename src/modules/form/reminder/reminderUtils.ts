import {
  ReminderDetail,
  ReminderRecipient,
  ReminderRequest,
  ReminderValue,
} from "./reminderTypes";

const DEFAULT_REMINDER_TIME = "09:00";

function defaultReminderValue(): ReminderValue {
  return {
    enabled: false,
    timeOfDay: DEFAULT_REMINDER_TIME,
    recipients: [],
  };
}

// The backend returns "17:00:00"; <input type="time"> wants "17:00".
function toTimeInput(timeOfDay: string | null): string {
  return timeOfDay ? timeOfDay.slice(0, 5) : DEFAULT_REMINDER_TIME;
}

function fromReminderDetail(detail: ReminderDetail): ReminderValue {
  return {
    enabled: detail.enabled,
    timeOfDay: toTimeInput(detail.timeOfDay),
    recipients: detail.recipients,
  };
}

function toReminderRequest(value: ReminderValue): ReminderRequest {
  return {
    enabled: value.enabled,
    timeOfDay: value.timeOfDay,
    recipients: value.recipients.map(({ type, id }) => ({ type, id })),
  };
}

// A reminder that is switched on needs a time; switched off is always valid.
function isReminderValid(value: ReminderValue): boolean {
  return !value.enabled || Boolean(value.timeOfDay);
}

// Replaces every recipient of one type, leaving the other type untouched.
function replaceRecipientsOfType(
  current: ReminderRecipient[],
  type: ReminderRecipient["type"],
  next: ReminderRecipient[],
): ReminderRecipient[] {
  return [...current.filter((r) => r.type !== type), ...next];
}

export {
  defaultReminderValue,
  fromReminderDetail,
  isReminderValid,
  replaceRecipientsOfType,
  toReminderRequest,
  toTimeInput,
};
