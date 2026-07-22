"use client";

import { Stack, Typography } from "@mui/material";
import { useState } from "react";

import GenericTable from "@/components/table/GenericTable";
import { GlobalRowsPerPage } from "@/core/types";

import { AnswerRow, TaskResponseResponse } from "../formViewerIdTypes";

function ResponseTable({
  response,
}: {
  response: TaskResponseResponse["value"];
}) {
  const { questionTitle, answers } = response;

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<GlobalRowsPerPage | -1>(5);

  const columns: (keyof AnswerRow)[] = ["Full Name", "Answer"];

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

  return (
    <Stack spacing={1}>
      <Typography variant={"h4"}>{"Question: " + questionTitle}</Typography>
      <GenericTable<keyof AnswerRow>
        rows={answers}
        columns={columns as Array<keyof AnswerRow>}
        page={page}
        handleChangePage={handleChangePage}
        rowsPerPage={rowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        allRowsCount={answers.length}
      />
    </Stack>
  );
}

export default ResponseTable;
