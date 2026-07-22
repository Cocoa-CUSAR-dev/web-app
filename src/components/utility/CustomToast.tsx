import {
  CheckRounded,
  CloseRounded,
  InfoRounded,
  WarningRounded,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { type Toast, toast, type ToastOptions } from "react-hot-toast";

const DefaultToastOption: ToastOptions = {
  duration: Infinity,
  style: {
    width: "300px",
    maxWidth: "300px",
    background: "white",
    padding: "0",
  },
};

function ToastBody({
  t,
  icon,
  iconBg,
  primaryMessage,
  secondaryMessage,
}: {
  t: Toast;
  icon: React.ReactNode;
  iconBg: string;
  primaryMessage: string;
  secondaryMessage?: string;
}) {
  return (
    <Stack
      direction={"row"}
      justifyContent={"start"}
      alignItems={"center"}
      bgcolor={"white"}
      left={"0"}
      padding={"0.75rem"}
      width={"100%"}
      sx={{
        wordBreak: "break-word",
      }}
      spacing={1}
    >
      <Box
        component="div"
        sx={{
          backgroundColor: iconBg,
          color: "white",
          borderRadius: "calc(infinity * 1px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "1.5rem",
          height: "1.5rem",
          flexShrink: "0",
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.5} alignItems="start" padding={"0 1.5rem 0 0"}>
        <Typography
          sx={{
            color: "black",
            fontSize: "1rem",
          }}
        >
          {primaryMessage}
        </Typography>
        {secondaryMessage && (
          <Typography
            sx={{
              color: grey[600],
              fontSize: "0.875rem",
            }}
          >
            {secondaryMessage}
          </Typography>
        )}
      </Stack>
      <IconButton
        size="small"
        onClick={() => {
          toast.dismiss(t.id);
        }}
        sx={{
          position: "absolute",
          top: "0.5rem",
          right: "0.5rem",
          color: "lightgray",
          "&:hover": {
            color: "gray",
          },
          hover: "cursor-pointer",
        }}
      >
        <CloseRounded />
      </IconButton>
    </Stack>
  );
}

const CustomToast = {
  success(
    primaryMessage: string,
    secondaryMessage?: string,
    options?: ToastOptions,
  ): string {
    return toast(
      (t) => (
        <ToastBody
          t={t}
          icon={<CheckRounded sx={{ width: "75%", height: "75%" }} />}
          iconBg="rgba(50,180,50,1)"
          primaryMessage={primaryMessage}
          secondaryMessage={secondaryMessage}
        />
      ),
      {
        ...DefaultToastOption,
        ...options,
      },
    );
  },

  error(
    primaryMessage: string,
    secondaryMessage?: string,
    options?: ToastOptions,
  ): string {
    return toast(
      (t) => (
        <ToastBody
          t={t}
          icon={<CloseRounded sx={{ width: "75%", height: "75%" }} />}
          iconBg="rgba(255, 50, 50, 1)"
          primaryMessage={primaryMessage}
          secondaryMessage={secondaryMessage}
        />
      ),
      {
        ...DefaultToastOption,
        ...options,
      },
    );
  },

  warning(
    primaryMessage: string,
    secondaryMessage?: string,
    options?: ToastOptions,
  ): string {
    return toast(
      (t) => (
        <ToastBody
          t={t}
          icon={<WarningRounded sx={{ width: "75%", height: "75%" }} />}
          iconBg="#FFC107"
          primaryMessage={primaryMessage}
          secondaryMessage={secondaryMessage}
        />
      ),
      {
        ...DefaultToastOption,
        ...options,
      },
    );
  },

  loading(
    primaryMessage: string,
    secondaryMessage?: string,
    options?: ToastOptions,
  ): string {
    return toast(
      (t) => (
        <ToastBody
          t={t}
          icon={<CircularProgress size={24} />}
          iconBg=""
          primaryMessage={primaryMessage}
          secondaryMessage={secondaryMessage}
        />
      ),
      {
        ...DefaultToastOption,
        ...options,
        duration: Infinity,
      },
    );
  },

  info(
    primaryMessage: string,
    secondaryMessage?: string,
    options?: ToastOptions,
  ): string {
    return toast(
      (t) => (
        <ToastBody
          t={t}
          icon={<InfoRounded sx={{ width: "100%", height: "100%" }} />}
          iconBg="#007BFF"
          primaryMessage={primaryMessage}
          secondaryMessage={secondaryMessage}
        />
      ),
      {
        ...DefaultToastOption,
        ...options,
      },
    );
  },

  promise<T>(
    promise: Promise<T>,
    msgs?: {
      loading?: string;
      success?: string;
      error?: string;
    },
    desc?: {
      loading?: string;
      success?: string;
      error?: string;
    },
    opts?: ToastOptions,
  ): Promise<T> {
    // const errorMessage = msgs?.error ?? "เกิดข้อผิดพลาด";

    const id =
      opts?.id ??
      CustomToast.loading(
        msgs?.loading ?? "กำลังโหลด",
        desc?.loading,
        opts ?? DefaultToastOption,
      );

    return promise
      .then((result) => {
        CustomToast.success(msgs?.success ?? "สำเร็จ", desc?.success, {
          ...(opts ?? DefaultToastOption),
          id,
        });
        return result; // Ensure the promise resolves with the original value
      })
      .catch((error) => {
        CustomToast.error(msgs?.error ?? "เกิดข้อผิดพลาด", desc?.error, {
          ...(opts ?? DefaultToastOption),
          id,
        });
        throw error; // Re-throw the error to ensure proper rejection handling
      });
  },

  dismiss(id?: string): void {
    // If an ID is provided, dismiss that specific toast; otherwise, dismiss all toasts.
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  },
};

export { CustomToast };
