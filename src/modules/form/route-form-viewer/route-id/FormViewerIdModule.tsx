"use client";

import { Box, Divider, Skeleton, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { fetchResponse } from "@/libs/fetchResponse";

import ResponseTableModule from "./components/ResponseTable";
import { TaskResponseResponse } from "./formViewerIdTypes";

function FormViewerIdModule({ taskId }: { taskId: string }) {
  const [responses, setResponses] = useState<Array<
    TaskResponseResponse["value"]
  > | null>(null);
  const [taskName, setTaskName] = useState<string | null>(null);

  const toastIdRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      if (toastIdRef.current) {
        CustomToast.dismiss(toastIdRef.current);
      }
      try {
        const toastId = "form-view-" + taskId;
        const response = await CustomToast.promise(
          fetchResponse(`/api/v1/tasks/${taskId}/responses`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          {
            loading: "getting tasks...",
            success: "successfully getting forms",
            error: "an error occured, please try again",
          },
          undefined,
          {
            duration: 5000,
            id: toastId,
          },
        );
        if (!response.ok) {
          throw new Error("error getting forms");
        }
        const { value } = await response.json();
        const formattedResponsesObj = value.map(
          (v: {
            questionTitle: string;
            answers: { fullName: string; answer: string }[];
          }) => ({
            questionTitle: v.questionTitle,
            answers: v.answers.map(
              (a: { fullName: string; answer: string }) => ({
                "Full Name": a.fullName,
                Answer: a.answer,
              }),
            ),
          }),
        );
        setResponses(formattedResponsesObj);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [taskId]);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/v1/tasks/${taskId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("error getting forms");
        }
        const { value } = await response.json();
        const { title } = value;
        setTaskName(title);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [taskId]);

  if (!responses) {
    return (
      <Stack spacing={3} height={"100%"} divider={<Divider flexItem />}>
        <Stack direction={"row"} spacing={2} alignItems={"center"}>
          <Typography variant={"h2"}>{"Response:"}</Typography>
          {taskName ? (
            <Typography variant={"h2"} noWrap>
              {taskName}
            </Typography>
          ) : (
            <Box height={"2.5rem"} width={"100%"}>
              <Skeleton
                variant={"rounded"}
                width={"100%"}
                height={"100%"}
                animation={"wave"}
              />
            </Box>
          )}
        </Stack>
        <Box width={"100%"} height={"100%"}>
          <Skeleton
            variant={"rounded"}
            width={"100%"}
            height={"100%"}
            animation={"wave"}
          />
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={3} height={"100%"} divider={<Divider flexItem />}>
      <Stack direction={"row"} spacing={2} alignItems={"center"}>
        <Typography variant={"h2"}>{"Response:"}</Typography>
        {taskName ? (
          <Typography variant={"h2"} noWrap>
            {taskName}
          </Typography>
        ) : (
          <Box height={"2.5rem"} width={"100%"}>
            <Skeleton
              variant={"rounded"}
              width={"100%"}
              height={"100%"}
              animation={"wave"}
            />
          </Box>
        )}
      </Stack>
      <Stack spacing={4} paddingBottom={"3rem"}>
        {responses.length > 0 ? (
          responses.map((response, idx) => (
            <ResponseTableModule
              key={response.questionTitle + idx}
              response={response}
            />
          ))
        ) : (
          <Stack>
            <Typography>
              {
                "Currently, there is no response from this form. Please try again later."
              }
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default FormViewerIdModule;
