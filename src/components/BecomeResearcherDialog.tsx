"use client";

import { ScienceRounded } from "@mui/icons-material";
import {
  alpha,
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useState } from "react";

import { clientAuthApi } from "@/core/api/clientAuthApi";
import { organizations } from "@/core/constants";
import { useAuthInfo } from "@/hooks/useAuthInfo";

type BecomeResearcherDialogProps = {
  open: boolean;
  onClose: () => void;
};

// For someone signed in without the researcher role (a farmer who uses the
// web for their history): add it with the team's sign-up code. The route
// swaps the session for one holding the role; a full page load then shows
// the researcher pages.
function BecomeResearcherDialog({
  open,
  onClose,
}: BecomeResearcherDialogProps) {
  const { firstName, lastName } = useAuthInfo();
  const [signupCode, setSignupCode] = useState<string>("");
  const [first, setFirst] = useState<string>(firstName ?? "");
  const [last, setLast] = useState<string>(lastName ?? "");
  const [organization, setOrganization] = useState<string>("CUSAR");
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      await clientAuthApi.becomeResearcher({
        signupCode,
        firstName: first,
        lastName: last,
        organization,
      });
      window.location.assign("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      setSaving(false);
    }
  }, [first, last, organization, signupCode]);

  const canSubmit = [signupCode, first, last, organization].every((v) =>
    v.trim(),
  );

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth={"xs"}
      slotProps={{ paper: { sx: { borderRadius: "1rem" } } }}
    >
      <DialogContent>
        <Stack spacing={2}>
          <Stack spacing={2} alignItems={"center"} textAlign={"center"}>
            <Stack
              width={"3rem"}
              height={"3rem"}
              borderRadius={"50%"}
              alignItems={"center"}
              justifyContent={"center"}
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
              }}
            >
              <ScienceRounded />
            </Stack>
            <Typography variant={"h3"} fontWeight={600}>
              {"Become a researcher"}
            </Typography>
            <Typography variant={"body2"} color={"text.secondary"}>
              {"Enter the sign-up code the project team gave you."}
            </Typography>
          </Stack>
          <TextField
            size={"small"}
            label={"Sign-up code"}
            value={signupCode}
            onChange={(e) => setSignupCode(e.target.value)}
          />
          <Stack direction={"row"} spacing={1}>
            <TextField
              size={"small"}
              label={"First Name"}
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
            <TextField
              size={"small"}
              label={"Last Name"}
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </Stack>
          <Autocomplete
            value={organization}
            options={organizations}
            renderInput={(params) => (
              <TextField {...params} size={"small"} label={"Organization"} />
            )}
            onChange={(_, newValue: string | null) => {
              if (newValue) setOrganization(newValue);
            }}
          />
          {error && (
            <Typography variant={"body2"} color={"error"}>
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ padding: "0 1.5rem 1.5rem" }}>
        <Button onClick={onClose} disabled={saving} fullWidth>
          {"Cancel"}
        </Button>
        <Button
          variant={"contained"}
          onClick={handleConfirm}
          disabled={saving || !canSubmit}
          fullWidth
        >
          {"Add role"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BecomeResearcherDialog;
