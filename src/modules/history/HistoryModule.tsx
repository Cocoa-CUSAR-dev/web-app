"use client";

import { Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { HttpError } from "@/core/error";
import { fetchResponse } from "@/libs/fetchResponse";

import DiaryCard from "./components/DiaryCard";
import SubmissionAnswersTable from "./components/SubmissionAnswersTable";
import SubmissionDayList from "./components/SubmissionDayList";
import {
  AnswerField,
  DiaryResponse,
  SubmissionAnswersResponse,
  SubmissionDaysResponse,
} from "./historyTypes";

// US2-6/US5-1 (docs-and-plan#130, #134): the farmer's own submission
// history -- a diary card for a day one was generated for, the raw
// submitted fields otherwise (a date before this feature existed, or a day
// nothing was generated for).
function HistoryModule() {
  const [days, setDays] = useState<string[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [dayContentLoading, setDayContentLoading] = useState<boolean>(false);
  const [diaryText, setDiaryText] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerField[] | null>(null);

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
      setAnswers(null);
      try {
        const response = await fetchResponse(
          `/api/v1/diaries/${selectedDate}`,
          { method: "GET" },
        );
        const { value }: DiaryResponse = await response.json();
        setDiaryText(value.diaryText);
      } catch (e) {
        if (e instanceof HttpError && e.status === 404) {
          // No diary was ever generated for this day -- fall back to the
          // raw submitted fields instead of showing nothing.
          try {
            const fallbackResponse = await fetchResponse(
              `/api/v1/history/${selectedDate}`,
              { method: "GET" },
            );
            const { value }: SubmissionAnswersResponse =
              await fallbackResponse.json();
            setAnswers(value);
          } catch (fallbackError) {
            console.error(fallbackError);
            CustomToast.error("ไม่สามารถโหลดข้อมูลของวันนี้ได้");
          }
        } else {
          console.error(e);
          CustomToast.error("ไม่สามารถโหลดข้อมูลของวันนี้ได้");
        }
      } finally {
        setDayContentLoading(false);
      }
    })();
  }, [selectedDate]);

  if (!days) {
    return (
      <Stack spacing={3} padding={{ xs: "1rem", sm: "1rem 2rem" }}>
        <Typography variant={"h2"}>{"History"}</Typography>
        <Skeleton variant={"rounded"} width={"100%"} height={"20rem"} />
      </Stack>
    );
  }

  return (
    <Stack
      spacing={3}
      height={"100%"}
      padding={{ xs: "1rem", sm: "1rem 2rem" }}
      divider={<Divider flexItem />}
    >
      <Typography variant={"h2"}>{"History"}</Typography>
      {days.length === 0 ? (
        <Typography>{"You have no submissions yet."}</Typography>
      ) : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
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
            ) : answers ? (
              <SubmissionAnswersTable answers={answers} />
            ) : null}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

export default HistoryModule;
