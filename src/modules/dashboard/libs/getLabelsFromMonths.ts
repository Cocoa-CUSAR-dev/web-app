import { defaultLabels } from "../dashboardConstants";

function getLabelsFromMonths(
  fromMonth: number,
  fromYear: number,
  toMonth: number,
  toYear: number,
): string[] {
  const labels: string[] = [];
  const monthNames = defaultLabels;

  const current = new Date(fromYear, fromMonth - 1, 1);
  const end = new Date(toYear, toMonth - 1, 1);

  while (current <= end) {
    labels.push(monthNames[current.getMonth()]);

    current.setMonth(current.getMonth() + 1);
  }

  return labels;
}

export { getLabelsFromMonths };
