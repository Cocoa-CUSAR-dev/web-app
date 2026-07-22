import { farmColumns, globalRowsPerPage } from "../constants";

type FarmColumn = (typeof farmColumns)[number];
type GlobalRowsPerPage = (typeof globalRowsPerPage)[number];

export type { FarmColumn, GlobalRowsPerPage };
