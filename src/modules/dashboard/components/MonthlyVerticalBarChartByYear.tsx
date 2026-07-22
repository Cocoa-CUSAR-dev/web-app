"use client";

import {
  Box,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BarChartTypeData } from "@/core/types";

import { getLabelsFromMonths } from "../libs/getLabelsFromMonths";
import MonthlyVerticalBarChart from "./MonthlyVerticalBarChart";

function MonthlyVerticalBarChartByYear({
  title,
  datasets,
  onLoadData,
  numYear = 4,
  chartLoading = false,
}: {
  title: string;
  datasets?: BarChartTypeData[] | null;
  onLoadData?:
    | ((fromM: number, fromY: number, toM: number, toY: number) => void)
    | ((
        fromM: number,
        fromY: number,
        toM: number,
        toY: number,
      ) => Promise<void>);
  numYear?: number;
  chartLoading?: boolean;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectingOptionIndex, setSelectingOptionIndex] = useState<number>(0);

  const currentDate = useMemo(() => new Date(), []);
  const currentYear = useMemo(() => currentDate.getFullYear(), [currentDate]);

  const options = useMemo(() => {
    const arr = [];
    for (let i = 0; i < numYear; i++) {
      arr.push((currentYear - i).toString());
    }
    return arr;
  }, [currentYear, numYear]);

  const currentRange = useMemo(() => {
    const selectedYear = parseInt(options[selectingOptionIndex]);
    return [1, selectedYear, 12, selectedYear];
  }, [options, selectingOptionIndex]);

  const labels = useMemo(() => {
    return getLabelsFromMonths(
      currentRange[0],
      currentRange[1],
      currentRange[2],
      currentRange[3],
    );
  }, [currentRange]);

  const disableToNextYear = useMemo(() => {
    if (selectingOptionIndex === 0) return true;
    return false;
  }, [selectingOptionIndex]);

  const disableToPreviousYear = useMemo(() => {
    if (selectingOptionIndex === numYear - 1) return true;
    return false;
  }, [numYear, selectingOptionIndex]);

  const handleOptionChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue !== null) {
      const newIndex = options.indexOf(newValue);
      try {
        setIsLoading(true);
        setSelectingOptionIndex(newIndex);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(true);
      }
    }
  };

  const handleLoadData = useCallback(async () => {
    if (!onLoadData) return null;
    try {
      setIsLoading(true);
      await onLoadData(
        currentRange[0],
        currentRange[1],
        currentRange[2],
        currentRange[3],
      );
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [currentRange, onLoadData]);

  // #region initial load
  useEffect(() => {
    if (!handleLoadData) return;
    handleLoadData();
  }, [currentRange, handleLoadData]);

  // #region debug

  if (numYear < 1) return null;
  return (
    <Box
      width={"100%"}
      height={"100%"}
      position={"relative"}
      borderRadius={"0.5rem"}
      display={"flex"}
      flexDirection={"column"}
      alignItems={"center"}
    >
      <ToggleButtonGroup
        value={options[selectingOptionIndex]}
        onChange={handleOptionChange}
        exclusive={true}
        disabled={isLoading}
      >
        {options
          .slice()
          .reverse()
          .map((option, idx) => {
            return (
              <ToggleButton
                value={option}
                key={"toggle-button" + idx}
                sx={{
                  textTransform: "none",
                  fontWeight: 400,
                  fontSize: "0.875rem",
                }}
              >
                {option}
              </ToggleButton>
            );
          })}
      </ToggleButtonGroup>
      <MonthlyVerticalBarChart
        title={title}
        datasets={datasets}
        loading={isLoading}
        onToNextYear={() => {
          setSelectingOptionIndex((idx) => idx - 1);
        }}
        onToPreviousYear={() => {
          setSelectingOptionIndex((idx) => idx + 1);
        }}
        labels={labels}
        year={
          selectingOptionIndex === 0
            ? currentYear
            : options[selectingOptionIndex]
        }
        disableToNextYear={disableToNextYear}
        disableToPreviousYear={disableToPreviousYear}
      />
      {chartLoading && (
        <Box
          width={"100%"}
          height={"100%"}
          position={"absolute"}
          top={"0"}
          left={"0"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          bgcolor={"white"}
          borderRadius={"0.5rem"}
          sx={{
            opacity: "0.33",
          }}
        >
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
}

export default MonthlyVerticalBarChartByYear;
