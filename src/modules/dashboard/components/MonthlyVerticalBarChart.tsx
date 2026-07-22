"use client";

import {
  NavigateBeforeRounded,
  NavigateNextRounded,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { ChartOptions } from "chart.js";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useCallback, useMemo } from "react";
import { Bar } from "react-chartjs-2";

import { BarChartTypeData } from "@/core/types";

import { defaultLabels } from "../dashboardConstants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function MonthlyVerticalBarChart({
  title = "",
  datasets,
  loading = false,
  onToNextYear,
  onToPreviousYear,
  year,
  labels = defaultLabels,
  disableToNextYear = false,
  disableToPreviousYear = false,
}: {
  title?: string;
  datasets?: BarChartTypeData[] | null;
  loading?: boolean;
  onToNextYear?: (() => void) | (() => Promise<void>);
  onToPreviousYear?: (() => void) | (() => Promise<void>);
  year: string | number;
  labels?: string[];
  disableToNextYear?: boolean;
  disableToPreviousYear?: boolean;
}) {
  const chartTitle = title + " in " + year;

  const options = useMemo<ChartOptions<"bar">>(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
          display: datasets
            ? datasets.every((dataset) => Boolean(dataset["label"]))
            : false,
        },
      },
    };
  }, [datasets]);

  const data = useMemo(() => {
    if (!datasets) return null;
    return {
      labels,
      datasets: datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.backgroundColor,
      })),
    };
  }, [datasets, labels]);

  // #region change year
  const toNextYear = useCallback(() => {
    if (onToNextYear) {
      onToNextYear();
    }
  }, [onToNextYear]);

  const toPreviousYear = useCallback(() => {
    if (onToPreviousYear) {
      onToPreviousYear();
    }
  }, [onToPreviousYear]);

  return (
    <Stack width={"100%"} height={"100%"} alignItems={"center"}>
      <Stack direction={"row"} alignItems={"center"}>
        <IconButton
          disabled={loading || disableToPreviousYear}
          onClick={() => {
            toPreviousYear();
          }}
        >
          <NavigateBeforeRounded />
        </IconButton>
        {title ? (
          <Typography
            paddingTop={"0.25rem"}
            textAlign={"center"}
            variant={"body2"}
          >
            {chartTitle}
          </Typography>
        ) : (
          <Box width={"12rem"} height={"1.3125rem"} paddingTop={"0.25rem"}>
            <Skeleton
              variant={"rounded"}
              width={"100%"}
              height={"100%"}
              animation={"wave"}
            />
          </Box>
        )}
        <IconButton
          disabled={loading || disableToNextYear}
          onClick={() => {
            toNextYear();
          }}
        >
          <NavigateNextRounded />
        </IconButton>
      </Stack>
      <Box
        width={"100%"}
        maxWidth={"100%"}
        maxHeight={"100%"}
        flex={"1"}
        position={"relative"}
        minHeight={"0"}
        minWidth={"0"}
        sx={{
          overflow: "hidden",
        }}
      >
        {data ? (
          <Box position={"absolute"} top={0} left={0} right={0} bottom={0}>
            <Bar options={options} data={data} />
          </Box>
        ) : (
          <Box height={"100%"}>
            <Skeleton variant={"rounded"} height={"100%"} animation={"wave"} />
          </Box>
        )}
        {/* loading component overlay */}
        {loading && (
          <Box
            position={"absolute"}
            width={"100%"}
            height={"100%"}
            top={"0"}
            left={"0"}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            bgcolor={"white"}
            sx={{
              opacity: "0.33",
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Stack>
  );
}

export default MonthlyVerticalBarChart;
