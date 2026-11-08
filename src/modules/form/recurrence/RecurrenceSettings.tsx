"use client";

import {
  Alert,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import { RecurrenceFrequency, RecurrenceValue } from "./recurrenceTypes";
import { FREQUENCY_LABELS, recurrenceError, WEEKDAYS } from "./recurrenceUtils";

type RecurrenceSettingsProps = {
  value: RecurrenceValue;
  onChange: (next: RecurrenceValue) => void;
  // The task's own open/close time, only used to explain what is wrong.
  openAt: string;
  closeAt: string;
  disabled?: boolean;
};

// "Repeat this task": the task being created is round #1, and a fresh copy
// opens every period after it for the same people.
function RecurrenceSettings({
  value,
  onChange,
  openAt,
  closeAt,
  disabled,
}: RecurrenceSettingsProps) {
  const repeats = value.frequency !== "NONE";
  const error = recurrenceError(value, openAt, closeAt);

  return (
    <Stack spacing={2}>
      <TextField
        select
        size={"small"}
        label={"Repeat"}
        disabled={disabled}
        value={value.frequency}
        onChange={(e) =>
          onChange({
            ...value,
            frequency: e.target.value as RecurrenceFrequency,
          })
        }
      >
        {(Object.keys(FREQUENCY_LABELS) as RecurrenceFrequency[]).map(
          (frequency) => (
            <MenuItem key={frequency} value={frequency}>
              {FREQUENCY_LABELS[frequency]}
            </MenuItem>
          ),
        )}
      </TextField>

      {repeats && (
        <Stack spacing={2}>
          {value.frequency === "WEEKLY" && (
            <Stack spacing={0.5}>
              <Typography variant={"body2"} color={"text.secondary"}>
                {"On these days"}
              </Typography>
              <ToggleButtonGroup
                size={"small"}
                color={"primary"}
                disabled={disabled}
                value={value.weekdays}
                onChange={(_, days: number[]) =>
                  // The group hands back the whole selection in click order.
                  onChange({
                    ...value,
                    weekdays: [...days].sort((a, b) => a - b),
                  })
                }
                aria-label={"Weekdays"}
              >
                {WEEKDAYS.map((weekday) => (
                  <ToggleButton
                    key={weekday.value}
                    value={weekday.value}
                    aria-label={weekday.label}
                  >
                    {weekday.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Stack>
          )}

          <TextField
            size={"small"}
            type={"date"}
            label={"Stop repeating after (optional)"}
            disabled={disabled}
            slotProps={{ inputLabel: { shrink: true } }}
            value={value.untilDate}
            onChange={(e) => onChange({ ...value, untilDate: e.target.value })}
            helperText={"Leave empty to keep repeating with no end date."}
          />

          <Typography variant={"body2"} color={"text.secondary"}>
            {
              "The task you are creating is the first round. Each new round opens on its day at the same time of day, stays open for the same length, and goes to the same people."
            }
          </Typography>

          {error && <Alert severity={"warning"}>{error}</Alert>}
        </Stack>
      )}
    </Stack>
  );
}

export default RecurrenceSettings;
