import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Dayjs } from "dayjs";

// Extend dayjs with needed plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(customParseFormat);

// Error messages type
export type ErrorMessages = {
  readonly invalidDate: string;
  readonly pastDate: string;
  readonly futureLimit: string;
  readonly validTillAfterFrom: string;
  readonly maxDuration: string;
};

export const errorMessages: ErrorMessages = {
  invalidDate: "Please provide a valid date in YYYY-MM-DD format",
  pastDate: "Date cannot be in the past",
  futureLimit: "Date cannot be more than 1 year in the future",
  validTillAfterFrom: "Valid till date must be after valid from date",
  maxDuration: "Duration cannot exceed 1 year",
};

export const isValidDate = (date: string): boolean => {
  return dayjs(date, "YYYY-MM-DD", true).isValid();
};

export default dayjs;
