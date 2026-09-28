"use client";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { useEffect, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { fetchResponse } from "@/libs/fetchResponse";

import ReminderSettings from "./ReminderSettings";
import { ReminderDetailResponse, ReminderValue } from "./reminderTypes";
import {
  defaultReminderValue,
  fromReminderDetail,
  isReminderValid,
  toReminderRequest,
} from "./reminderUtils";

type ReminderDialogProps = {
  open: boolean;
  formId: string | null;
  onClose: () => void;
};

// Reminder settings for a form that already exists (the create-form page
// sets them once at creation; this is where they are changed or switched
// off afterwards).
function ReminderDialog({ open, formId, onClose }: ReminderDialogProps) {
  const [value, setValue] = useState<ReminderValue>(defaultReminderValue());
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!open || !formId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const response = await fetchResponse(
          `/api/v1/forms/${formId}/reminder`,
          {
            method: "GET",
          },
        );
        const { value: detail }: ReminderDetailResponse = await response.json();
        if (!cancelled) setValue(fromReminderDetail(detail));
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setValue(defaultReminderValue());
          CustomToast.error("failed to load reminder settings", undefined, {
            duration: 5000,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, formId]);

  const handleSave = async () => {
    if (!formId || !isReminderValid(value)) return;
    try {
      setSaving(true);
      await CustomToast.promise(
        fetchResponse(`/api/v1/forms/${formId}/reminder`, {
          method: "PUT",
          body: JSON.stringify(toReminderRequest(value)),
        }),
        {
          loading: "saving reminder...",
          success: "reminder saved",
          error: "failed to save reminder, please try again",
        },
        undefined,
        { duration: 3000 },
      );
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={"sm"}>
      <DialogTitle>{"Reminder settings"}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Stack alignItems={"center"} padding={"2rem"}>
            <CircularProgress />
          </Stack>
        ) : (
          <Stack paddingTop={"0.5rem"}>
            <ReminderSettings
              value={value}
              onChange={setValue}
              disabled={saving}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {"Cancel"}
        </Button>
        <Button
          variant={"contained"}
          onClick={handleSave}
          disabled={loading || saving || !isReminderValid(value)}
        >
          {"Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReminderDialog;
