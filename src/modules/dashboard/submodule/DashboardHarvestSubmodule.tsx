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

import MonthlyVerticalBarChartByYear from "../components/MonthlyVerticalBarChartByYear";
import { useTimeSeriesChart } from "../hooks/useTimeSeriesChart";

const dashboardHarvestGuide: Step[] = [];
const endpoint = "/api/v1/analytics/harvest/time-series";

function DashboardHarvestSubmodule() {
  // #region checkbox
  const [isDeltaSelected, setIsDeltaSelected] = useState<boolean>(true);
  const [isSumSelected, setIsSumSelected] = useState<boolean>(true);
  const [isAverageSelected, setIsAverageSelected] = useState<boolean>(true);
  const [isFrequencySelected, setIsFrequencySelected] = useState<boolean>(true);

  // #region data
  const {
    title: harvestTimeSeriesDeltaTitle,
    data: dataHarvestTimeSeriesDelta,
    onLoadData: onLoadHarvestTimeSeriesDelta,
  } = useTimeSeriesChart(endpoint, "delta", { method: "POST" });

  const {
    title: harvestTimeSeriesSumTitle,
    data: dataHarvestTimeSeriesSum,
    onLoadData: onLoadHarvestTimeSeriesSum,
  } = useTimeSeriesChart(endpoint, "sum", { method: "POST" });

  const {
    title: harvestTimeSeriesAverageTitle,
    data: dataHarvestTimeSeriesAverage,
    onLoadData: onLoadHarvestTimeSeriesAverage,
  } = useTimeSeriesChart(endpoint, "average", { method: "POST" });

  const {
    title: harvestTimeSeriesFrequencyTitle,
    data: dataHarvestTimeSeriesFrequency,
    onLoadData: onLoadHarvestTimeSeriesFrequency,
  } = useTimeSeriesChart(endpoint, "frequency", { method: "POST" });

  const isAllSelected =
    isDeltaSelected &&
    isSumSelected &&
    isAverageSelected &&
    isFrequencySelected;

  const isSomeSelected =
    [
      isDeltaSelected,
      isSumSelected,
      isAverageSelected,
      isFrequencySelected,
    ].some(Boolean) && !isAllSelected;

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
      id={"dashboard-harvest-container"}
    >
      <Stack
        direction={"row"}
        width={"100%"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Typography variant={"h2"}>{"Harvest Data"}</Typography>
        <FormGroup
          sx={{
            flexDirection: "row",
            width: "fit",
          }}
        >
          <Tooltip
            title={"There must be at least one chart."}
            placement={"top"}
            sx={{
              marginRight: "1rem",
              padding: "0.25rem",
            }}
          >
            <Box marginRight={"0.5rem"}>
              <UnControlledRerunableTutorial
                isIconButton={true}
                steps={dashboardHarvestGuide}
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
                      setIsAverageSelected(false);
                      setIsFrequencySelected(false);
                      return;
                    }
                    if (isAllSelected) {
                      setIsDeltaSelected(false);
                      setIsSumSelected(false);
                      setIsAverageSelected(false);
                      setIsFrequencySelected(false);
                      return;
                    }
                    if (!isSomeSelected) {
                      setIsDeltaSelected(true);
                      setIsSumSelected(true);
                      setIsAverageSelected(true);
                      setIsFrequencySelected(true);
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
                title={"Harvest weight added each month"}
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
                title={"Running total of harvest weight over time"}
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
          <FormControlLabel
            control={
              <Tooltip
                placement={"top"}
                title={"Average harvest weight per record within each month"}
              >
                <Checkbox
                  checked={isAverageSelected}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setIsAverageSelected(e.target.checked);
                  }}
                />
              </Tooltip>
            }
            label={"Average"}
          />
          <FormControlLabel
            control={
              <Tooltip
                placement={"top"}
                title={"Numer of record logged each month"}
              >
                <Checkbox
                  checked={isFrequencySelected}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setIsFrequencySelected(e.target.checked);
                  }}
                />
              </Tooltip>
            }
            label={"Frequency"}
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
                onLoadData={onLoadHarvestTimeSeriesDelta}
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
                onLoadData={onLoadHarvestTimeSeriesSum}
              />
            </Box>
          </FitCard>
        )}
        {isAverageSelected && (
          <FitCard flex={1}>
            <Box minWidth={"20rem"} width={"100%"} height={"20rem"}>
              <MonthlyVerticalBarChartByYear
                title={harvestTimeSeriesAverageTitle}
                datasets={dataHarvestTimeSeriesAverage}
                onLoadData={onLoadHarvestTimeSeriesAverage}
              />
            </Box>
          </FitCard>
        )}
        {isFrequencySelected && (
          <FitCard flex={1}>
            <Box minWidth={"20rem"} width={"100%"} height={"20rem"}>
              <MonthlyVerticalBarChartByYear
                title={harvestTimeSeriesFrequencyTitle}
                datasets={dataHarvestTimeSeriesFrequency}
                onLoadData={onLoadHarvestTimeSeriesFrequency}
              />
            </Box>
          </FitCard>
        )}
      </Stack>
    </Stack>
  );
}

export default DashboardHarvestSubmodule;
