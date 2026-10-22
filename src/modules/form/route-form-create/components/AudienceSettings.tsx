"use client";

import { Stack, Typography } from "@mui/material";

import RecipientPicker from "../../reminder/RecipientPicker";
import { ReminderRecipient } from "../../reminder/reminderTypes";

type AudienceSettingsProps = {
  recipients: ReminderRecipient[];
  onChange: (next: ReminderRecipient[]) => void;
  disabled?: boolean;
};

// "Who is this task for?" -- same ROLE / USER rules as the reminder, but they
// decide who SEES the task (and, for a repeating one, who every new round
// goes to), not just who is reminded.
function AudienceSettings({
  recipients,
  onChange,
  disabled,
}: AudienceSettingsProps) {
  return (
    <Stack spacing={2}>
      <Typography variant={"subtitle1"}>{"Who is this task for?"}</Typography>
      <Typography variant={"body2"} color={"text.secondary"}>
        {
          "Pick roles and/or individual people. Leave both empty to show the task to everyone."
        }
      </Typography>
      <RecipientPicker
        recipients={recipients}
        onChange={onChange}
        disabled={disabled}
      />
    </Stack>
  );
}

export default AudienceSettings;
