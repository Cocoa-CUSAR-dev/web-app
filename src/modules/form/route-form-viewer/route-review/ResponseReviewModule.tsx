"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  FormControlLabel,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { HttpError } from "@/core/error";
import { fetchResponse } from "@/libs/fetchResponse";

import CorrectFieldDialog, {
  CorrectionTarget,
} from "./components/CorrectFieldDialog";
import ReviewSubmissionCard from "./components/ReviewSubmissionCard";
import { ReviewField, ReviewResponse, ReviewSubmission } from "./reviewTypes";
import { replaceField } from "./reviewUtils";

const PAGE_SIZE = 20;

function loadErrorMessage(e: unknown): string {
  if (e instanceof HttpError && e.status === 403) {
    return "You don't have permission to review this form's submissions.";
  }
  return "Could not load the submissions. Please try again.";
}

// US2-8 (docs-and-plan#172): lets a researcher see what each farmer
// submitted (and which values the AI extracted) and fix anything wrong.
function ResponseReviewModule({ taskId }: { taskId: string }) {
  const router = useRouter();

  const [taskName, setTaskName] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<ReviewSubmission[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiOnly, setAiOnly] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [target, setTarget] = useState<CorrectionTarget | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`/api/v1/tasks/${taskId}`, {
          method: "GET",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("error getting task");
        }
        const { value } = await response.json();
        setTaskName(value.title);
      } catch (e) {
        if (!controller.signal.aborted) console.error(e);
      }
    })();
    return () => controller.abort();
  }, [taskId]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      setSubmissions(null);
      setLoadError(null);
      try {
        const response = await fetchResponse(`/api/v1/tasks/${taskId}/review`, {
          method: "GET",
          queryParams: { aiOnly, page, size: PAGE_SIZE },
          signal: controller.signal,
        });
        const { value } = (await response.json()) as ReviewResponse;
        setSubmissions(value);
      } catch (e) {
        if (!controller.signal.aborted) setLoadError(loadErrorMessage(e));
      }
    })();
    return () => controller.abort();
  }, [taskId, aiOnly, page]);

  const handleSaved = (responseId: string, updated: ReviewField) => {
    setSubmissions(
      (current) => current && replaceField(current, responseId, updated),
    );
    setTarget(null);
  };

  const handleAiOnlyChange = (checked: boolean) => {
    setPage(0);
    setAiOnly(checked);
  };

  return (
    <Stack
      spacing={3}
      divider={<Divider flexItem />}
      padding={{ xs: "1rem", sm: "1rem 2rem" }}
    >
      <Stack
        direction={"row"}
        spacing={2}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexWrap={"wrap"}
        useFlexGap
      >
        <Stack direction={"row"} spacing={2} alignItems={"center"} minWidth={0}>
          <Typography variant={"h2"}>{"Review:"}</Typography>
          {taskName ? (
            <Typography variant={"h2"} noWrap>
              {taskName}
            </Typography>
          ) : (
            <Skeleton variant={"rounded"} width={"16rem"} height={"2.5rem"} />
          )}
        </Stack>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <FormControlLabel
            label={"AI-extracted only"}
            control={
              <Switch
                checked={aiOnly}
                onChange={(e) => handleAiOnlyChange(e.target.checked)}
              />
            }
          />
          <Button
            variant={"outlined"}
            onClick={() => router.push(`/form/form-viewer/${taskId}`)}
          >
            {"Back to responses"}
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3} paddingBottom={"3rem"}>
        {loadError && <Alert severity={"error"}>{loadError}</Alert>}

        {!loadError && submissions === null && (
          <Box height={"16rem"}>
            <Skeleton
              variant={"rounded"}
              width={"100%"}
              height={"100%"}
              animation={"wave"}
            />
          </Box>
        )}

        {submissions?.length === 0 && (
          <Typography>
            {aiOnly
              ? "No submissions with AI-extracted values on this page."
              : "There are no submissions to review yet."}
          </Typography>
        )}

        {submissions?.map((submission) => (
          <ReviewSubmissionCard
            key={submission.responseId}
            submission={submission}
            onEdit={(responseId, field) => setTarget({ responseId, field })}
          />
        ))}

        {submissions !== null &&
          (page > 0 || submissions.length === PAGE_SIZE) && (
            <Stack direction={"row"} spacing={2} justifyContent={"center"}>
              <Button disabled={page === 0} onClick={() => setPage(page - 1)}>
                {"Previous"}
              </Button>
              <Typography alignSelf={"center"}>{`Page ${page + 1}`}</Typography>
              <Button
                disabled={submissions.length < PAGE_SIZE}
                onClick={() => setPage(page + 1)}
              >
                {"Next"}
              </Button>
            </Stack>
          )}
      </Stack>

      <CorrectFieldDialog
        taskId={taskId}
        target={target}
        onClose={() => setTarget(null)}
        onSaved={handleSaved}
      />
    </Stack>
  );
}

export default ResponseReviewModule;
