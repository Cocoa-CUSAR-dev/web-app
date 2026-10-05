"use client";

import {
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import { ReviewField, ReviewSubmission } from "../reviewTypes";
import {
  aiFieldCount,
  formatSubmittedAt,
  isAiExtracted,
  sourceLabel,
} from "../reviewUtils";

type ReviewSubmissionCardProps = {
  submission: ReviewSubmission;
  onEdit: (responseId: string, field: ReviewField) => void;
};

function ReviewSubmissionCard({
  submission,
  onEdit,
}: ReviewSubmissionCardProps) {
  const aiCount = aiFieldCount(submission);

  return (
    <Paper elevation={2} component={"section"}>
      <Stack spacing={1.5} padding={"1.25rem"}>
        <Stack
          direction={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap"}
          gap={1}
        >
          <Typography variant={"h5"}>{submission.submitter}</Typography>
          <Stack direction={"row"} spacing={1} alignItems={"center"}>
            {aiCount > 0 && (
              <Chip
                size={"small"}
                color={"warning"}
                label={`${aiCount} AI-extracted`}
              />
            )}
            <Typography variant={"body2"} color={"text.secondary"}>
              {formatSubmittedAt(submission.submittedAt)}
            </Typography>
          </Stack>
        </Stack>
        <Divider />

        {submission.fields.map((field) => {
          const label = sourceLabel(field.source);
          const ai = isAiExtracted(field);
          return (
            <Stack
              key={field.fieldName}
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 0.5, sm: 2 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Typography
                color={"text.secondary"}
                sx={{ flex: { sm: "0 0 30%" } }}
              >
                {field.label}
              </Typography>
              <Typography sx={{ flex: 1, wordBreak: "break-word" }}>
                {field.value ?? "-"}
              </Typography>
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                {label && (
                  <Chip
                    size={"small"}
                    variant={ai ? "filled" : "outlined"}
                    color={ai ? "warning" : "default"}
                    label={label}
                  />
                )}
                <Tooltip
                  title={
                    field.editable
                      ? ""
                      : "This type of field can't be corrected here yet"
                  }
                >
                  <span>
                    <Button
                      size={"small"}
                      variant={"outlined"}
                      disabled={!field.editable}
                      aria-label={`Edit ${field.label}`}
                      onClick={() => onEdit(submission.responseId, field)}
                    >
                      {"Edit"}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}

export default ReviewSubmissionCard;
