import React from "react";

import { DefaultResponseType } from "@/core/types";

type DashboardContent = {
  label: string;
  link: string;
};

type DashboardContentContextType = {
  content: DashboardContent[];
  setContent: React.Dispatch<React.SetStateAction<DashboardContent[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isShowing: boolean;
  setIsShowing: React.Dispatch<React.SetStateAction<boolean>>;
};

type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

type MonthlyData = {
  value: number | null;
};

// #region timeseries
type TimeSeriesValue = {
  label: string;
  values: number[];
  unit?: string | null;
};

type TimeSeriesData = {
  from: string;
  to: string;
  title: string;
  metadataa: {
    provinceId: string | null;
    districtId: string | null;
    subdistrictId: string | null;
    farmId: string | null;
  };
  series: TimeSeriesValue[];
};

type TimeSeriesDataResponse = DefaultResponseType<TimeSeriesData>;

// #region summary
type SummaryData = {
  from: string;
  to: string;
  title: string;
  metadata: {
    provinceId: string | null;
    districtId: string | null;
    subdistrictId: string | null;
    farmId: string | null;
  };
  data: {
    label: string;
    value: number;
    unit: string;
  };
};

type SummaryDataResponse = DefaultResponseType<SummaryData>;

export type {
  DashboardContent,
  DashboardContentContextType,
  MonthlyData,
  MonthNumber,
  SummaryDataResponse,
  TimeSeriesDataResponse,
};
