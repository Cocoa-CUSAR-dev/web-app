"use client";

import { FileDownloadRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Link,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { CustomToast } from "@/components/utility/CustomToast";
import { fetchResponse } from "@/libs/fetchResponse";
import { handleFileResponseXlsx } from "@/libs/handleFileResponse";

import type { TaskObject, TasksResponse } from "./route-id/formViewerIdTypes";

function FormViewerModule() {
  // #region states
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [tasks, setTasks] = useState<TaskObject[]>([]);

  // #region form download
  const [isHarvestSelected, setIsHarvestSelected] = useState<boolean>(false);
  const [isFarmSelected, setIsFarmSelected] = useState<boolean>(false);

  const queryParameter = useMemo(() => {
    if (isHarvestSelected && isFarmSelected) {
      return "?sheets=HARVEST,FARM";
    }
    if (isHarvestSelected) {
      return "?sheets=HARVEST";
    }
    if (isFarmSelected) {
      return "?sheets=FARM";
    }
    return "";
  }, [isHarvestSelected, isFarmSelected]);

  const handleDownload = useCallback(async () => {
    try {
      setIsDownloading(true);
      const response = await fetchResponse(
        `/api/v1/forms/download${queryParameter}`,
        {
          method: "GET",
        },
      );
      await handleFileResponseXlsx(response);
    } catch (e) {
      console.error(e);
      CustomToast.error("Download Error: please try again in a second");
    } finally {
      setIsDownloading(false);
    }
  }, [queryParameter]);

  const handleAllChange = useCallback(() => {
    if (isHarvestSelected !== isFarmSelected) {
      setIsHarvestSelected(false);
      setIsFarmSelected(false);
      return;
    }

    if (isHarvestSelected && isFarmSelected) {
      setIsHarvestSelected(false);
      setIsFarmSelected(false);
      return;
    }

    if (!isHarvestSelected && !isFarmSelected) {
      setIsHarvestSelected(true);
      setIsFarmSelected(true);
      return;
    }
  }, [isFarmSelected, isHarvestSelected]);

  const formDownloadButton = useMemo(() => {
    return (
      <>
        <Button
          variant={"contained"}
          disabled={isDownloading || (!isHarvestSelected && !isFarmSelected)}
          disableElevation={true}
          disableRipple={true}
          onClick={handleDownload}
          endIcon={<FileDownloadRounded />}
          sx={{
            display: {
              xs: "none",
              sm: "inline-flex",
            },
          }}
        >
          {"Form Response Download"}
        </Button>
        <Button
          variant={"contained"}
          disabled={isDownloading || (!isHarvestSelected && !isFarmSelected)}
          disableElevation={true}
          disableRipple={true}
          onClick={handleDownload}
          endIcon={<FileDownloadRounded />}
          sx={{
            display: {
              xs: "inline-flex",
              sm: "none",
            },
          }}
        >
          {"Form"}
        </Button>
      </>
    );
  }, [handleDownload, isDownloading, isFarmSelected, isHarvestSelected]);

  const formDownloadOptionCheckboxes = useMemo(() => {
    return (
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={{
          xs: 1,
          md: 3,
        }}
      >
        <FormGroup
          id={"form-download-checkbox-group"}
          sx={{
            flexDirection: {
              xs: "column",
              sm: "row",
            },
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={isHarvestSelected && isFarmSelected}
                indeterminate={isHarvestSelected !== isFarmSelected}
                onChange={handleAllChange}
                sx={{
                  padding: "0.25rem",
                }}
              />
            }
            label={"All"}
            slotProps={{
              typography: {
                variant: "caption",
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isHarvestSelected}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setIsHarvestSelected(e.target.checked);
                }}
                sx={{
                  padding: "0.25rem",
                }}
              />
            }
            label={"Harvest"}
            slotProps={{
              typography: {
                variant: "caption",
              },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isFarmSelected}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setIsFarmSelected(e.target.checked);
                }}
                sx={{
                  padding: "0.25rem",
                }}
              />
            }
            label={"Farm"}
            slotProps={{
              typography: {
                variant: "caption",
              },
            }}
          />
        </FormGroup>
        <FormGroup
          sx={{
            flexDirection: "row",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                defaultChecked
                disabled
                sx={{
                  padding: "0.25rem",
                }}
              />
            }
            label={"XLSX"}
            slotProps={{
              typography: {
                variant: "caption",
              },
            }}
          />
        </FormGroup>
      </Stack>
    );
  }, [handleAllChange, isFarmSelected, isHarvestSelected]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const response = await fetchResponse("/api/v1/tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("error getting forms");
        }
        const { value } = (await response.json()) as TasksResponse;
        setTasks(value);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // #region component
  return (
    <Stack spacing={3} width={"100%"} height={"100%"}>
      <Stack
        width={"100%"}
        justifyContent={"space-between"}
        alignItems={"center"}
        direction={"row"}
      >
        <Stack
          width={"100%"}
          alignItems={{
            xs: "start",
            md: "center",
          }}
          justifyContent={"space-between"}
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={{
            xs: 1,
            md: 2,
          }}
          id={"form-viewer-header"}
        >
          <Typography variant={"h2"}>{"Form Viewer"}</Typography>
          <Box
            flex={{
              xs: 0,
              md: 1,
            }}
            display={{
              xs: "none",
              md: "block",
            }}
            height={"2px"}
            bgcolor={"darkgrey"}
          ></Box>
          <Stack
            direction={"row"}
            alignItems={"center"}
            width={{
              xs: "100%",
              md: "fit-content",
            }}
            justifyContent={{
              xs: "space-between",
              md: "end",
            }}
          >
            {formDownloadOptionCheckboxes}
            <Box
              flex={1}
              display={{
                md: "none",
              }}
              height={"2px"}
              bgcolor={"darkgrey"}
              marginRight={"1rem"}
            ></Box>
            {formDownloadButton}
          </Stack>
        </Stack>
      </Stack>
      <Stack
        width={"100%"}
        height={"100%"}
        spacing={2}
        padding={isLoading ? "0" : "0 0 2rem 0"}
      >
        <Typography variant={"h3"}>{"List of Forms"}</Typography>
        {isLoading ? (
          <Box
            width={"100%"}
            height={"100%"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Skeleton
              variant={"rounded"}
              width={"100%"}
              height={"100%"}
              animation={"wave"}
            />
          </Box>
        ) : (
          <Stack
            width={"100%"}
            borderRadius={"0.25rem"}
            border={"1px solid lightgrey"}
            divider={<Divider flexItem />}
            id={"task-list-container"}
          >
            {tasks.map((task, idx) => {
              const { title, taskId } = task;
              return (
                <Link
                  key={title + idx}
                  href={`/form/form-viewer/${taskId}`}
                  underline={"none"}
                  sx={{
                    padding: "0.75rem 1rem",
                    backgroundColor: "white",
                    transition: "background-color 150ms ease",
                    "&:hover": {
                      backgroundColor: "#F0FFC2",
                      cursor: "pointer",
                    },
                  }}
                >
                  {title}
                </Link>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export default FormViewerModule;
