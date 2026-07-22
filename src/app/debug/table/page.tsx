"use client";

import { Stack } from "@mui/material";
import { useState } from "react";

import GenericTable from "@/components/table/GenericTable";
import { SlidingPagination } from "@/components/table/SlidingPagination";
import { type FarmColumn, GlobalRowsPerPage } from "@/core/types";

const allFarmRows: Record<FarmColumn, string | number>[] = [
  {
    Name: "Jingle",
    Area: 34,
    "NO. of Plot": 8,
    Status:
      "Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, Out of Service, ",
  },
  {
    Name: "Kluaymai",
    Area: 30,
    "NO. of Plot": 2,
    Status: "Out of Service",
  },
  {
    Name: "BimbimBa",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "วิมลพรรณ",
    Area: 990,
    "NO. of Plot": 48,
    Status: "Out of Service",
  },
  {
    Name: "ลักขณา",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
  {
    Name: "Jingle",
    Area: 30,
    "NO. of Plot": 42,
    Status: "Out of Service",
  },
];

const columns: FarmColumn[] = ["Name", "Area", "NO. of Plot", "Status"];

export default function DebugTable() {
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<GlobalRowsPerPage | -1>(5);
  const [excludedColumns] = useState<FarmColumn[]>([]);
  const [allRowsCount] = useState<number>(allFarmRows.length);

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

  const [minPage] = useState<number>(1);
  const [maxPage] = useState<number>(3);
  const [page2, setPage2] = useState<number>(1);

  return (
    <Stack padding={"3rem"}>
      <GenericTable<FarmColumn>
        dense={true}
        excludedColumns={excludedColumns}
        rows={allFarmRows}
        page={page}
        handleChangePage={handleChangePage}
        rowsPerPage={rowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        allRowsCount={allRowsCount}
        columns={columns}
      />
      <SlidingPagination
        minPage={minPage}
        maxPage={maxPage}
        currentPage={page2}
        onChange={(page2: number) => {
          setPage2(page2);
        }}
      />
    </Stack>
  );
}
