"use client";

import { Stack, Typography } from "@mui/material";
import { useState } from "react";

import GenericTable from "@/components/table/GenericTable";
import { GlobalRowsPerPage } from "@/core/types";

import { AnswerField } from "../historyTypes";

// US2-6/US5-1 (docs-and-plan#134): fallback view for a day with no diary
// entry yet (a date before this feature existed, or one nothing was
// generated for) -- the raw form fields this feature was meant to replace.
function SubmissionAnswersTable({ answers }: { answers: AnswerField[] }) {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<GlobalRowsPerPage | -1>(10);

  const rows = answers.map((answer) => ({
    Field: answer.label,
    Value: answer.rawValue,
  }));
  const columns: ("Field" | "Value")[] = ["Field", "Value"];

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const value = parseInt(
      event.target.value,
      10,
    ) as unknown as GlobalRowsPerPage;
    setRowsPerPage(value);
    setPage(0);
  };

  if (answers.length === 0) {
    return (
      <Stack>
        <Typography>{"No submissions for this day."}</Typography>
      </Stack>
    );
  }

  return (
    <GenericTable<"Field" | "Value">
      rows={rows}
      columns={columns}
      page={page}
      handleChangePage={handleChangePage}
      rowsPerPage={rowsPerPage}
      handleChangeRowsPerPage={handleChangeRowsPerPage}
      allRowsCount={rows.length}
    />
  );
}

export default SubmissionAnswersTable;
