"use client";

import { Box, Paper, Stack, useTheme } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import { BarChartTypeData } from "@/core/types";
import MonthlyVerticalBarChart from "@/modules/dashboard/components/MonthlyVerticalBarChart";
import MonthlyVerticalBarChartByYear from "@/modules/dashboard/components/MonthlyVerticalBarChartByYear";
import { dashboardMonthlyDataStub } from "@/stubs/dashboard/dashboardMonthlyDataStub";

const mockChart1: BarChartTypeData[] = [
  {
    label: "Test Dataset 1",
    data: [12, 28, 10, 31, 22, 9, 10, 55, 39, null, 12, 9],
    backgroundColor: "rgba(243, 98, 111, 1)",
  },
  {
    label: "Test Dataset 2",
    data: [33, 22, 12, 16, null, 0, null, null, 41, 29, 28, 37],
    backgroundColor: "rgb(98, 243, 141)",
  },
];

const mockChart2: BarChartTypeData[] = [
  {
    label: "Test Dataset 3",
    data: [33, 22, 12, 16, 4, 0, 22, 93, 41, 29, 28, 37],
    backgroundColor: "rgba(243, 98, 111, 1)",
  },
  {
    // label: "Test Dataset 4",
    data: [12, 28, 10, 31, 22, 9, 10, 55, 39, 20, 12, 9],
    backgroundColor: "rgb(80, 144, 216)",
  },
];

function DebugChart() {
  const theme = useTheme();

  const [year, setYear] = useState<number>(2026);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);

  const [data, setData] = useState<BarChartTypeData[] | null>(null);

  useEffect(() => {
    (async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      setData(mockChart1);
    })();
  }, []);

  const toNextYear = useCallback(async () => {
    try {
      setIsChartLoading(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      setData(mockChart2);
      setYear((y) => y + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  const toPreviousYear = useCallback(async () => {
    try {
      setIsChartLoading(true);
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      setData(mockChart1);
      setYear((y) => y - 1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  // #region managed datasets
  const [datasets2, setDataset2] = useState<BarChartTypeData[] | null>(null);

  const title2 = "Roasted Chicken Sale";
  const numYear = 3;

  const onLoadData = useCallback(
    async (fromM: number, fromY: number, toM: number, toY: number) => {
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
      const rawData = await dashboardMonthlyDataStub(fromM, fromY, toM, toY);
      const data = rawData.map((d) => d["value"]);
      const numericOnlyData = data
        .slice()
        .map((d) => (d !== null ? d : -Infinity));
      const maxIndex = numericOnlyData.indexOf(Math.max(...numericOnlyData));
      setDataset2([
        {
          data: data,
          backgroundColor: new Array<string>(data.length)
            .fill(theme.palette.primary.main, 0, maxIndex)
            .fill(theme.palette.primary.main, maxIndex + 1)
            .fill(theme.palette.primary.dark, maxIndex, maxIndex + 1),
        },
      ]);
    },
    [theme.palette.primary.dark, theme.palette.primary.main],
  );

  return (
    <Stack padding={"3rem"} overflow={"auto"} spacing={2}>
      <Box width={"32rem"} height={"22rem"}>
        <MonthlyVerticalBarChart
          datasets={data}
          title={"Cocoa Harvest"}
          year={year}
          loading={isChartLoading}
          onToNextYear={toNextYear}
          onToPreviousYear={toPreviousYear}
        />
      </Box>
      <Paper
        elevation={2}
        sx={{
          padding: "2rem",
          width: "fit-content",
        }}
      >
        <Box width={"32rem"} height={"22rem"}>
          <MonthlyVerticalBarChartByYear
            title={title2}
            datasets={datasets2}
            onLoadData={onLoadData}
            numYear={numYear}
          />
        </Box>
      </Paper>
    </Stack>
  );
}

export default DebugChart;
