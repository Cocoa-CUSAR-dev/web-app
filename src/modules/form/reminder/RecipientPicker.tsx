"use client";

import { Autocomplete, Chip, Stack, TextField } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import { fetchResponse } from "@/libs/fetchResponse";

import {
  ReminderRecipient,
  RoleOptionsResponse,
  UserOptionsResponse,
} from "./reminderTypes";
import { replaceRecipientsOfType } from "./reminderUtils";

type RecipientPickerProps = {
  recipients: ReminderRecipient[];
  onChange: (next: ReminderRecipient[]) => void;
  disabled?: boolean;
  // The role and user lists are only fetched while this is true, so a section
  // that is switched off does not call the backend.
  active?: boolean;
};

const USER_SEARCH_DEBOUNCE_MS = 300;

// Pick who something is aimed at: whole roles and/or individual people. Shared
// by the reminder settings ("who to remind") and a task's own audience ("who
// is this task for") -- both are the same ROLE / USER rules.
function RecipientPicker({
  recipients,
  onChange,
  disabled,
  active = true,
}: RecipientPickerProps) {
  const [roleOptions, setRoleOptions] = useState<ReminderRecipient[]>([]);
  const [userOptions, setUserOptions] = useState<ReminderRecipient[]>([]);
  const [userQuery, setUserQuery] = useState<string>("");

  const selectedRoles = useMemo(
    () => recipients.filter((r) => r.type === "ROLE"),
    [recipients],
  );
  const selectedUsers = useMemo(
    () => recipients.filter((r) => r.type === "USER"),
    [recipients],
  );

  // roles: a short list, loaded once
  useEffect(() => {
    if (!active) return;
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
  }, [active]);

  // users: searched on the server (there can be many), debounced
  useEffect(() => {
    if (!active) return;
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
  }, [active, userQuery]);

  // Keep already-picked people in the options so their chips never vanish
  // when a new search no longer returns them.
  const userOptionsWithSelected = useMemo(() => {
    const known = new Set(userOptions.map((u) => u.id));
    return [...userOptions, ...selectedUsers.filter((u) => !known.has(u.id))];
  }, [userOptions, selectedUsers]);

  return (
    <Stack spacing={2}>
      <Autocomplete
        multiple
        size={"small"}
        disabled={disabled}
        options={roleOptions}
        value={selectedRoles}
        getOptionLabel={(o) => o.label}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        onChange={(_, next) =>
          onChange(replaceRecipientsOfType(recipients, "ROLE", next))
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
          onChange(replaceRecipientsOfType(recipients, "USER", next))
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
  );
}

export default RecipientPicker;
