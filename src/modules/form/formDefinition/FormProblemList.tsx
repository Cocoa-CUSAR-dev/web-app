"use client";

import { Alert, AlertTitle, Box } from "@mui/material";

// Shown by the save button: the problems still in the form (why the button
// is disabled), or the ones Kotlin rejected the last save with.
function FormProblemList({
  title,
  messages,
}: {
  title: string;
  messages: string[];
}) {
  if (messages.length === 0) return null;
  return (
    <Alert severity={"error"}>
      <AlertTitle>{title}</AlertTitle>
      <Box component={"ul"} margin={0} paddingLeft={"1.25rem"}>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </Box>
    </Alert>
  );
}

export default FormProblemList;
