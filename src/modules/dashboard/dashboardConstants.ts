import { DashboardContent } from "./dashboardTypes";

const dashboardPages = [
  {
    label: "Dashboard",
    link: "/dashboard",
  },
  {
    label: "Dashboard Map",
    link: "/dashboard/map",
  },
] as const;

const defaultLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

const dashboardModuleContents: DashboardContent[] = [
  {
    label: "Harvest Data",
    link: "#dashboard-harvest-container",
  },
  {
    label: "User Data",
    link: "#dashboard-user-container",
  },
];

const dashboardMapModuleContents: DashboardContent[] = [
  {
    label: "Harvest Data",
    link: "#dashboard-map-harvest-container",
  },
  {
    label: "User Data",
    link: "#dashboard-map-user-container",
  },
];

export {
  dashboardMapModuleContents,
  dashboardModuleContents,
  dashboardPages,
  defaultLabels,
};
