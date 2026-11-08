"use client";

import { LogoutRounded } from "@mui/icons-material";
import {
  alpha,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useAuthInfo } from "@/hooks/useAuthInfo";

type LogoutConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
};

function LogoutConfirmDialog({ open, onClose }: LogoutConfirmDialogProps) {
  const { logout } = useAuthInfo();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const handleConfirm = useCallback(async () => {
    setLoggingOut(true);
    const isLoggedOut = await logout();
    setLoggingOut(false);
    if (isLoggedOut) {
      router.push("/auth?page=login");
    }
  }, [logout, router]);

  return (
    <Dialog
      open={open}
      onClose={loggingOut ? undefined : onClose}
      fullWidth
      maxWidth={"xs"}
      slotProps={{ paper: { sx: { borderRadius: "1rem" } } }}
    >
      <DialogContent>
        <Stack spacing={2} alignItems={"center"} textAlign={"center"}>
          <Stack
            width={"3rem"}
            height={"3rem"}
            borderRadius={"50%"}
            alignItems={"center"}
            justifyContent={"center"}
            sx={{
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.12),
              color: "error.main",
            }}
          >
            <LogoutRounded />
          </Stack>
          <Typography variant={"h3"} fontWeight={600}>
            {"Log out?"}
          </Typography>
          <Typography variant={"body2"} color={"text.secondary"}>
            {"You'll need to log in again to access your account."}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ padding: "0 1.5rem 1.5rem" }}>
        <Button onClick={onClose} disabled={loggingOut} fullWidth>
          {"Cancel"}
        </Button>
        <Button
          variant={"contained"}
          color={"error"}
          onClick={handleConfirm}
          disabled={loggingOut}
          fullWidth
        >
          {"Log Out"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default LogoutConfirmDialog;
