import { Color } from ".";

type BarChartTypeData = {
  label?: string;
  data: (number | null)[];
  backgroundColor: Color | Color[];
};

export type { BarChartTypeData };
