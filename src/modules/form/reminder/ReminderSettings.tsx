"use client";

import {
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import RecipientPicker from "./RecipientPicker";
import { ReminderValue } from "./reminderTypes";

type ReminderSettingsProps = {
  value: ReminderValue;
  onChange: (next: ReminderValue) => void;
  disabled?: boolean;
};

function ReminderSettings({
  value,
  onChange,
  disabled,
}: ReminderSettingsProps) {
  return (
    <Stack spacing={2}>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <FormControlLabel
          control={
            <Checkbox
              checked={value.enabled}
              disabled={disabled}
              onChange={(e) =>
                onChange({ ...value, enabled: e.target.checked })
              }
            />
          }
          label={"Send daily reminders to those who haven't submitted"}
        />
        {value.enabled && (
          <TextField
            size={"small"}
            type={"time"}
            label={"Reminder time"}
            disabled={disabled}
            slotProps={{ inputLabel: { shrink: true } }}
            value={value.timeOfDay}
            onChange={(e) => onChange({ ...value, timeOfDay: e.target.value })}
          />
        )}
      </Stack>

      {value.enabled && (
        <Stack spacing={2}>
          <Typography variant={"body2"} color={"text.secondary"}>
            {
              "Who to remind: pick roles and/or individual people. Leave both empty to remind everyone who hasn't submitted."
            }
          </Typography>
          <RecipientPicker
            recipients={value.recipients}
            onChange={(recipients) => onChange({ ...value, recipients })}
            disabled={disabled}
            active={value.enabled}
          />
        </Stack>
      )}
    </Stack>
  );
}

export default ReminderSettings;
