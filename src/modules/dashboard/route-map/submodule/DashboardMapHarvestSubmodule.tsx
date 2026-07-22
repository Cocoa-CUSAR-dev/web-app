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
import { useTheme } from "@mui/material/styles";
import { useCallback, useState } from "react";
import { Step } from "react-joyride";

import FitCard from "@/components/utility/FitCard";
import UnControlledRerunableTutorial from "@/components/utility/UnControlledRerunableTutorial";
import { HttpError } from "@/core/error";
import { BarChartTypeData } from "@/core/types";
import { fetchResponse } from "@/libs/fetchResponse";

import MonthlyVerticalBarChartByYear from "../../components/MonthlyVerticalBarChartByYear";
import { TimeSeriesDataResponse } from "../../dashboardTypes";

const dashboardMapHarvestGuide: Step[] = [];

function DashboardMapHarvestSubmodule({
  polygon,
}: {
  polygon: GeoJSON.Polygon | null;
}) {
  const theme = useTheme();

  // #region checkbox
  const [isDeltaSelected, setIsDeltaSelected] = useState<boolean>(true);
  const [isSumSelected, setIsSumSelected] = useState<boolean>(true);
  const [isAverageSelected, setIsAverageSelected] = useState<boolean>(true);
  const [isFrequencySelected, setIsFrequencySelected] = useState<boolean>(true);

  // #region data
  const [harvestTimeSeriesDeltaTitle, setHarvestTimeSeriesDeltaTitle] =
    useState<string>("");
  const [dataHarvestTimeSeriesDelta, setDataHarvestTimeSeriesDelta] = useState<
    BarChartTypeData[] | null
  >(null);

  const [harvestTimeSeriesSumTitle, setHarvestTimeSeriesSumTitle] =
    useState<string>("");
  const [dataHarvestTimeSeriesSum, setDataHarvestTimeSeriesSum] = useState<
    BarChartTypeData[] | null
  >(null);

  const [harvestTimeSeriesAverageTitle, setHarvestTimeSeriesAverageTitle] =
    useState<string>("");
  const [dataHarvestTimeSeriesAverage, setDataHarvestTimeSeriesAverage] =
    useState<BarChartTypeData[] | null>(null);

  const [harvestTimeSeriesFrequencyTitle, setHarvestTimeSeriesFrequencyTitle] =
    useState<string>("");
  const [dataHarvestTimeSeriesFrequency, setDataHarvestTimeSeriesFrequency] =
    useState<BarChartTypeData[] | null>(null);

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

  // #region function
  const onLoadHarvestTimeSeriesDelta = useCallback(
    async (fromM: number, fromY: number, toM: number, toY: number) => {
      try {
        const response = await fetchResponse(
          `/api/v1/analytics/harvest/time-series?mode=delta&from=${String(fromY).padStart(4, "0")}-${String(fromM).padStart(2, "0")}&to=${String(toY).padStart(4, "0")}-${String(toM).padStart(2, "0")}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ polygon: polygon }),
          },
        );
        if (!response.ok) {
          const { error } = await response.json();
          throw new HttpError(response.status, error ?? response.statusText);
        }
        const {
          value: { series, title },
        } = (await response.json()) as TimeSeriesDataResponse;
        setHarvestTimeSeriesDeltaTitle(title);
        const barChartObj: BarChartTypeData[] = series.map((s, idx) => {
          const color =
            idx === 0
              ? theme.palette.primary.main
              : idx === 1
                ? theme.palette.grey[600]
                : theme.palette.grey[400];
          return {
            label: s.label,
            data: s.values,
            backgroundColor: color,
          };
        });
        setDataHarvestTimeSeriesDelta(barChartObj);
      } catch (e) {
        console.log(e);
      }
    },
    [polygon, theme.palette.grey, theme.palette.primary.main],
  );

  const onLoadHarvestTimeSeriesSum = useCallback(
    async (fromM: number, fromY: number, toM: number, toY: number) => {
      try {
        const response = await fetchResponse(
          `/api/v1/analytics/harvest/time-series?mode=sum&from=${String(fromY).padStart(4, "0")}-${String(fromM).padStart(2, "0")}&to=${String(toY).padStart(4, "0")}-${String(toM).padStart(2, "0")}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ polygon }),
          },
        );
        if (!response.ok) {
          const { error } = await response.json();
          throw new HttpError(response.status, error ?? response.statusText);
        }
        const {
          value: { series, title },
        } = (await response.json()) as TimeSeriesDataResponse;
        setHarvestTimeSeriesSumTitle(title);
        const barChartObj: BarChartTypeData[] = series.map((s, idx) => {
          const color =
            idx === 0
              ? theme.palette.primary.main
              : idx === 1
                ? theme.palette.grey[600]
                : theme.palette.grey[400];
          return {
            label: s.label,
            data: s.values,
            backgroundColor: color,
          };
        });
        setDataHarvestTimeSeriesSum(barChartObj);
      } catch (e) {
        console.log(e);
      }
    },
    [polygon, theme.palette.grey, theme.palette.primary.main],
  );

  const onLoadHarvestTimeSeriesAverage = useCallback(
    async (fromM: number, fromY: number, toM: number, toY: number) => {
      try {
        const response = await fetchResponse(
          `/api/v1/analytics/harvest/time-series?mode=average&from=${String(fromY).padStart(4, "0")}-${String(fromM).padStart(2, "0")}&to=${String(toY).padStart(4, "0")}-${String(toM).padStart(2, "0")}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ polygon }),
          },
        );
        if (!response.ok) {
          const { error } = await response.json();
          throw new HttpError(response.status, error ?? response.statusText);
        }
        const {
          value: { series, title },
        } = (await response.json()) as TimeSeriesDataResponse;
        setHarvestTimeSeriesAverageTitle(title);
        const barChartObj: BarChartTypeData[] = series.map((s, idx) => {
          const color =
            idx === 0
              ? theme.palette.primary.main
              : idx === 1
                ? theme.palette.grey[600]
                : theme.palette.grey[400];
          return {
            label: s.label,
            data: s.values,
            backgroundColor: color,
          };
        });
        setDataHarvestTimeSeriesAverage(barChartObj);
      } catch (e) {
        console.log(e);
      }
    },
    [polygon, theme.palette.grey, theme.palette.primary.main],
  );

  const onLoadHarvestTimeSeriesFrequency = useCallback(
    async (fromM: number, fromY: number, toM: number, toY: number) => {
      try {
        const response = await fetchResponse(
          `/api/v1/analytics/harvest/time-series?mode=frequency&from=${String(fromY).padStart(4, "0")}-${String(fromM).padStart(2, "0")}&to=${String(toY).padStart(4, "0")}-${String(toM).padStart(2, "0")}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ polygon }),
          },
        );
        if (!response.ok) {
          const { error } = await response.json();
          throw new HttpError(response.status, error ?? response.statusText);
        }
        const {
          value: { series, title },
        } = (await response.json()) as TimeSeriesDataResponse;
        setHarvestTimeSeriesFrequencyTitle(title);
        const barChartObj: BarChartTypeData[] = series.map((s, idx) => {
          const color =
            idx === 0
              ? theme.palette.primary.main
              : idx === 1
                ? theme.palette.grey[600]
                : theme.palette.grey[400];
          return {
            label: s.label,
            data: s.values,
            backgroundColor: color,
          };
        });
        setDataHarvestTimeSeriesFrequency(barChartObj);
      } catch (e) {
        console.log(e);
      }
    },
    [polygon, theme.palette.grey, theme.palette.primary.main],
  );

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
      id={"dashboard-map-harvest-container"}
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
                steps={dashboardMapHarvestGuide}
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

export default DashboardMapHarvestSubmodule;
