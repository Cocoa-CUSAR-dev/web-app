"use client";

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Step } from "react-joyride";

import FitCard from "@/components/utility/FitCard";
import UnControlledRerunableTutorial from "@/components/utility/UnControlledRerunableTutorial";

import MonthlyVerticalBarChartByYear from "../../components/MonthlyVerticalBarChartByYear";
import { useTimeSeriesChart } from "../../hooks/useTimeSeriesChart";

const dashboardMapUserGuide: Step[] = [];
const endpoint = "/api/v1/analytics/user/time-series";

function DashboardMapUserSubmodule() {
  // #region checkbox
  const [isDeltaSelected, setIsDeltaSelected] = useState<boolean>(true);
  const [isSumSelected, setIsSumSelected] = useState<boolean>(true);

  // #region data
  const {
    title: harvestTimeSeriesDeltaTitle,
    data: dataHarvestTimeSeriesDelta,
    onLoadData: onLoadUserTimeSeriesDelta,
  } = useTimeSeriesChart(endpoint, "delta");

  const {
    title: harvestTimeSeriesSumTitle,
    data: dataHarvestTimeSeriesSum,
    onLoadData: onLoadUserTimeSeriesSum,
  } = useTimeSeriesChart(endpoint, "sum");

  const isAllSelected = isDeltaSelected && isSumSelected;

  const isSomeSelected =
    [isDeltaSelected, isSumSelected].some(Boolean) && !isAllSelected;

  // #region component
  return (
    <Stack
      alignItems={"start"}
      minWidth={"54rem"}
      width={"100%"}
      flexShrink={0}
      height={"auto"}
      spacing={2}
      padding={"2rem"}
      id={"dashboard-map-user-container"}
    >
      <Stack
        direction={"row"}
        width={"100%"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography variant={"h2"}>{"User Data"}</Typography>
        <FormGroup
          sx={{
            flexDirection: "row",
            width: "fit",
          }}
        >
          <Tooltip
            title={"there must be at least one chart."}
            placement={"top"}
            sx={{
              marginRight: "1rem",
              padding: "0.25rem",
            }}
          >
            <Box marginRight={"0.5rem"}>
              <UnControlledRerunableTutorial
                isIconButton={true}
                steps={dashboardMapUserGuide}
                skipInitialRun={true}
              />
            </Box>
          </Tooltip>
          <FormControlLabel
            control={
              <Tooltip
                placement={"top"}
                title={"Select or unselect every charts"}
              >
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onChange={() => {
                    if (isSomeSelected) {
                      setIsDeltaSelected(false);
                      setIsSumSelected(false);
                      return;
                    }
                    if (isAllSelected) {
                      setIsDeltaSelected(false);
                      setIsSumSelected(false);
                      return;
                    }
                    if (!isSomeSelected) {
                      setIsDeltaSelected(true);
                      setIsSumSelected(true);
                      return;
                    }
                  }}
                />
              </Tooltip>
            }
            label={"All"}
          />
          <FormControlLabel
            control={
              <Tooltip
                placement={"top"}
                title={"Number of user registered each month"}
              >
                <Checkbox
                  checked={isDeltaSelected}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setIsDeltaSelected(e.target.checked);
                  }}
                />
              </Tooltip>
            }
            label={"Delta"}
          />
          <FormControlLabel
            control={
              <Tooltip
                placement={"top"}
                title={"Running total of user in the system over time"}
              >
                <Checkbox
                  checked={isSumSelected}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setIsSumSelected(e.target.checked);
                  }}
                />
              </Tooltip>
            }
            label={"Sum"}
          />
        </FormGroup>
      </Stack>
      <Stack direction={"row"} width={"100%"} flexWrap={"wrap"} gap={"1rem"}>
        {isDeltaSelected && (
          <FitCard flex={1}>
            <Box minWidth={"20rem"} width={"100%"} height={"20rem"}>
              <MonthlyVerticalBarChartByYear
                title={harvestTimeSeriesDeltaTitle}
                datasets={dataHarvestTimeSeriesDelta}
                onLoadData={onLoadUserTimeSeriesDelta}
              />
            </Box>
          </FitCard>
        )}
        {isSumSelected && (
          <FitCard flex={1}>
            <Box minWidth={"20rem"} width={"100%"} height={"20rem"}>
              <MonthlyVerticalBarChartByYear
                title={harvestTimeSeriesSumTitle}
                datasets={dataHarvestTimeSeriesSum}
                onLoadData={onLoadUserTimeSeriesSum}
              />
            </Box>
          </FitCard>
        )}
      </Stack>
    </Stack>
  );
}

export default DashboardMapUserSubmodule;
