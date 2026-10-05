"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";

import { CorrectFieldResponse, ReviewField } from "../reviewTypes";
import { draftError, inputKind, isAiExtracted } from "../reviewUtils";

type CorrectionTarget = {
  responseId: string;
  field: ReviewField;
};

type CorrectFieldDialogProps = {
  taskId: string;
  target: CorrectionTarget | null;
  onClose: () => void;
  onSaved: (responseId: string, updated: ReviewField) => void;
};

type CorrectFieldFormProps = {
  taskId: string;
  target: CorrectionTarget;
  onClose: () => void;
  onSaved: (responseId: string, updated: ReviewField) => void;
};

// Mounted only while the dialog is open, so every open starts from the
// field's current value without any reset logic.
function CorrectFieldForm({
  taskId,
  target,
  onClose,
  onSaved,
}: CorrectFieldFormProps) {
  const { responseId, field } = target;
  const kind = inputKind(field.inputType);

  const [draft, setDraft] = useState<string>(
    kind === "boolean"
      ? (field.value ?? "").toLowerCase()
      : (field.value ?? ""),
  );
  const [reason, setReason] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const unchanged = draft.trim() === (field.value ?? "").trim();
  const error = draftError(field.inputType, draft);
  // Don't scold a field the reviewer hasn't touched yet.
  const shownError = unchanged ? null : error;

  const handleSave = async () => {
    setSaving(true);
    setServerError(null);
    try {
      // Raw fetch, not fetchResponse: that one drops the response body on
      // an error, and the backend's 400 message ("Value must be a whole
      // number") is exactly what the reviewer needs to see.
      const response = await fetch(
        `/api/v1/tasks/${encodeURIComponent(taskId)}/review/${encodeURIComponent(
          responseId,
        )}/fields/${encodeURIComponent(field.fieldName)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value: draft.trim(),
            reason: reason.trim() || undefined,
          }),
        },
      );
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setServerError(
          body?.error ?? "Could not save the correction. Please try again.",
        );
        return;
      }
      CustomToast.success("Correction saved");
      onSaved(responseId, (body as CorrectFieldResponse).value);
    } catch (e) {
      console.error(e);
      setServerError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DialogTitle>{"Correct: " + field.label}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} paddingTop={"0.5rem"}>
          {isAiExtracted(field) && (
            <Alert severity={"info"}>
              {"This value was extracted by AI from the farmer's message."}
            </Alert>
          )}
          <Typography variant={"body2"} color={"text.secondary"}>
            {"Current value: " + (field.value ?? "(empty)")}
          </Typography>

          {kind === "boolean" ? (
            <TextField
              select
              size={"small"}
              label={"New value"}
              value={draft}
              disabled={saving}
              onChange={(e) => setDraft(e.target.value)}
              error={Boolean(shownError)}
              helperText={shownError ?? " "}
            >
              <MenuItem value={"true"}>{"true"}</MenuItem>
              <MenuItem value={"false"}>{"false"}</MenuItem>
            </TextField>
          ) : (
            <TextField
              size={"small"}
              type={kind}
              label={"New value"}
              value={draft}
              disabled={saving}
              onChange={(e) => setDraft(e.target.value)}
              error={Boolean(shownError)}
              helperText={shownError ?? " "}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput:
                  kind === "number"
                    ? {
                        step:
                          field.inputType.toUpperCase() === "INT" ? 1 : "any",
                      }
                    : undefined,
              }}
            />
          )}

          <TextField
            size={"small"}
            label={"Reason (optional)"}
            value={reason}
            disabled={saving}
            onChange={(e) => setReason(e.target.value)}
          />

          <Typography variant={"caption"} color={"text.secondary"}>
            {
              "This updates the saved submission. Data already copied into other tables (for example harvest records) is not changed."
            }
          </Typography>

          {serverError && <Alert severity={"error"}>{serverError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {"Cancel"}
        </Button>
        <Button
          variant={"contained"}
          onClick={handleSave}
          disabled={saving || unchanged || error !== null}
        >
          {"Save"}
        </Button>
      </DialogActions>
    </>
  );
}

function CorrectFieldDialog({
  taskId,
  target,
  onClose,
  onSaved,
}: CorrectFieldDialogProps) {
  return (
    <Dialog open={target !== null} onClose={onClose} fullWidth maxWidth={"sm"}>
      {target && (
        <CorrectFieldForm
          key={target.responseId + target.field.fieldName}
          taskId={taskId}
          target={target}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Dialog>
  );
}

export default CorrectFieldDialog;
export type { CorrectionTarget };
