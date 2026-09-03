"use client";

import { useTheme } from "@mui/material/styles";
import { useCallback, useState } from "react";

import { HttpError } from "@/core/error";
import { BarChartTypeData } from "@/core/types";
import { FetchOption } from "@/core/types/httpTypes";
import { fetchResponse } from "@/libs/fetchResponse";

import { TimeSeriesDataResponse } from "../dashboardTypes";

type OnLoadTimeSeries = (
  fromM: number,
  fromY: number,
  toM: number,
  toY: number,
  signal?: AbortSignal,
) => Promise<void>;

// FE-4: this is the fetch -> destructure -> series.map -> setState pattern
// that used to be copy-pasted once per chart (4x in DashboardHarvestSubmodule,
// 2x in DashboardUserSubmodule, and again in both route-map variants).
// `body` is a thunk (not a plain value) so callers whose body depends on a
// prop (e.g. the map variants' `polygon`) always send the latest value
// without needing to re-create this hook's own callback identity per render.
function useTimeSeriesChart(
  endpoint: string,
  mode: string,
  options?: { method?: "GET" | "POST"; body?: () => unknown },
): {
  title: string;
  data: BarChartTypeData[] | null;
  onLoadData: OnLoadTimeSeries;
} {
  const theme = useTheme();
  const [title, setTitle] = useState<string>("");
  const [data, setData] = useState<BarChartTypeData[] | null>(null);
  const method = options?.method ?? "GET";
  const buildBody = options?.body;

  const onLoadData = useCallback<OnLoadTimeSeries>(
    async (fromM, fromY, toM, toY, signal) => {
      try {
        const from = `${String(fromY).padStart(4, "0")}-${String(fromM).padStart(2, "0")}`;
        const to = `${String(toY).padStart(4, "0")}-${String(toM).padStart(2, "0")}`;
        const path = `${endpoint}?mode=${mode}&from=${from}&to=${to}`;
        const fetchOption: FetchOption =
          method === "GET"
            ? {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                signal,
              }
            : {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: buildBody ? JSON.stringify(buildBody()) : undefined,
                signal,
              };

        const response = await fetchResponse(path, fetchOption);
        if (!response.ok) {
          const { error } = await response.json();
          throw new HttpError(response.status, error ?? response.statusText);
        }
        const {
          value: { series, title: newTitle },
        } = (await response.json()) as TimeSeriesDataResponse;
        setTitle(newTitle);
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
        setData(barChartObj);
      } catch (e) {
        // A cancelled request (superseded by a newer one) isn't a real
        // error -- don't log it as one.
        if (e instanceof DOMException && e.name === "AbortError") return;
        console.log(e);
      }
    },
    [
      endpoint,
      mode,
      method,
      buildBody,
      theme.palette.grey,
      theme.palette.primary.main,
    ],
  );

  return { title, data, onLoadData };
}

export { useTimeSeriesChart };
