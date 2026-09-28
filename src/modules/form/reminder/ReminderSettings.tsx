"use client";

import {
  Autocomplete,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { fetchResponse } from "@/libs/fetchResponse";

import {
  ReminderRecipient,
  ReminderValue,
  RoleOptionsResponse,
  UserOptionsResponse,
} from "./reminderTypes";
import { replaceRecipientsOfType } from "./reminderUtils";

type ReminderSettingsProps = {
  value: ReminderValue;
  onChange: (next: ReminderValue) => void;
  disabled?: boolean;
};

const USER_SEARCH_DEBOUNCE_MS = 300;

function ReminderSettings({
  value,
  onChange,
  disabled,
}: ReminderSettingsProps) {
  const [roleOptions, setRoleOptions] = useState<ReminderRecipient[]>([]);
  const [userOptions, setUserOptions] = useState<ReminderRecipient[]>([]);
  const [userQuery, setUserQuery] = useState<string>("");

  const selectedRoles = useMemo(
    () => value.recipients.filter((r) => r.type === "ROLE"),
    [value.recipients],
  );
  const selectedUsers = useMemo(
    () => value.recipients.filter((r) => r.type === "USER"),
    [value.recipients],
  );

  // roles: a short list, loaded once
  useEffect(() => {
    if (!value.enabled) return;
    (async () => {
      try {
        const response = await fetchResponse(
          "/api/v1/reminders/recipient-options/roles",
          { method: "GET" },
        );
        const { value: roles }: RoleOptionsResponse = await response.json();
        setRoleOptions(
          roles.map((r) => ({ type: "ROLE", id: r.roleId, label: r.roleName })),
        );
      } catch (e) {
        console.error(e);
      }
    })();
  }, [value.enabled]);

  // users: searched on the server (there can be many), debounced
  useEffect(() => {
    if (!value.enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetchResponse(
          "/api/v1/reminders/recipient-options/users",
          {
            method: "GET",
            queryParams: { q: userQuery },
            signal: controller.signal,
          },
        );
        const { value: users }: UserOptionsResponse = await response.json();
        setUserOptions(
          users.map((u) => ({
            type: "USER",
            id: u.userId,
            label: u.username,
          })),
        );
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error(e);
        }
      }
    }, USER_SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value.enabled, userQuery]);

  // Keep already-picked people in the options so their chips never vanish
  // when a new search no longer returns them.
  const userOptionsWithSelected = useMemo(() => {
    const known = new Set(userOptions.map((u) => u.id));
    return [...userOptions, ...selectedUsers.filter((u) => !known.has(u.id))];
  }, [userOptions, selectedUsers]);

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
          <Autocomplete
            multiple
            size={"small"}
            disabled={disabled}
            options={roleOptions}
            value={selectedRoles}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, next) =>
              onChange({
                ...value,
                recipients: replaceRecipientsOfType(
                  value.recipients,
                  "ROLE",
                  next,
                ),
              })
            }
            renderValue={(selected, getItemProps) =>
              selected.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <Chip
                    key={key}
                    size={"small"}
                    label={option.label}
                    {...itemProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField {...params} label={"Roles (e.g. farmer)"} />
            )}
          />
          <Autocomplete
            multiple
            size={"small"}
            disabled={disabled}
            options={userOptionsWithSelected}
            value={selectedUsers}
            filterOptions={(options) => options}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onInputChange={(_, text, reason) => {
              if (reason === "input" || reason === "clear") setUserQuery(text);
            }}
            onChange={(_, next) =>
              onChange({
                ...value,
                recipients: replaceRecipientsOfType(
                  value.recipients,
                  "USER",
                  next,
                ),
              })
            }
            renderValue={(selected, getItemProps) =>
              selected.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <Chip
                    key={key}
                    size={"small"}
                    label={option.label}
                    {...itemProps}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField {...params} label={"Individual people (search)"} />
            )}
          />
        </Stack>
      )}
    </Stack>
  );
}

export default ReminderSettings;
