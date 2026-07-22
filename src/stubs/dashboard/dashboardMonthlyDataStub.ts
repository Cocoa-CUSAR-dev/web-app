import { MonthlyData } from "@/modules/dashboard/dashboardTypes";

import { getRandomNumberArray } from "../libs/getRandomNumberArray";

async function dashboardMonthlyDataStub(
  fromMonth: number,
  fromYear: number,
  toMonth: number,
  toYear: number,
) {
  if (toYear < fromYear || (toYear === fromYear && toMonth < fromMonth)) {
    return [];
  }

  const fromAbsMonth = fromMonth + fromYear * 12;
  const toAbsMonth = toMonth + toYear * 12;

  const monthLength = toAbsMonth - fromAbsMonth + 1;

  const randomArr = (await getRandomNumberArray(monthLength)).map<MonthlyData>(
    (num) => ({
      value: num,
    }),
  );

  if (toYear <= 2025) return randomArr;

  return randomArr;
}

export { dashboardMonthlyDataStub };
