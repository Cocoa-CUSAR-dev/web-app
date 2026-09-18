"use client";

import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { fetchResponse } from "@/libs/fetchResponse";

import DiaryCard from "./components/DiaryCard";
import SubmissionDayList from "./components/SubmissionDayList";
import { DiaryResponse, SubmissionDaysResponse } from "./historyTypes";

// US2-6/US5-1 (docs-and-plan#130, #134): the farmer's own submission
// history -- a diary card for the selected day.
function HistoryModule() {
  const [days, setDays] = useState<string[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [dayContentLoading, setDayContentLoading] = useState<boolean>(false);
  const [diaryText, setDiaryText] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetchResponse("/api/v1/history", {
          method: "GET",
        });
        const { value }: SubmissionDaysResponse = await response.json();
        setDays(value);
        if (value.length > 0) {
          setSelectedDate(value[0]);
        }
      } catch (e) {
        console.error(e);
        CustomToast.error("ไม่สามารถโหลดประวัติการบันทึกได้");
        setDays([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    (async () => {
      setDayContentLoading(true);
      setDiaryText(null);
      try {
        const response = await fetchResponse(
          `/api/v1/diaries/${selectedDate}`,
          { method: "GET" },
        );
        const { value }: DiaryResponse = await response.json();
        setDiaryText(value.diaryText);
      } catch (e) {
        // No diary generated for this day yet -- see the fallback added
        // alongside GET /api/v1/history/[date] for the raw-fields view.
        console.error(e);
      } finally {
        setDayContentLoading(false);
      }
    })();
  }, [selectedDate]);

  if (!days) {
    return (
      <Stack spacing={3}>
        <Typography variant={"h2"}>{"History"}</Typography>
        <Skeleton variant={"rounded"} width={"100%"} height={"20rem"} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3} height={"100%"} divider={<Divider flexItem />}>
      <Typography variant={"h2"}>{"History"}</Typography>
      {days.length === 0 ? (
        <Typography>{"You have no submissions yet."}</Typography>
      ) : (
        <Stack direction={"row"} spacing={3}>
          <SubmissionDayList
            days={days}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
          <Stack flex={1} spacing={2}>
            {dayContentLoading ? (
              <Skeleton variant={"rounded"} width={"100%"} height={"12rem"} />
            ) : diaryText ? (
              <DiaryCard diaryText={diaryText} />
            ) : (
              <Typography>{"No diary entry for this day yet."}</Typography>
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

export default HistoryModule;
