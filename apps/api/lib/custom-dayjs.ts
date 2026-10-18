import * as dayjsNs from 'dayjs';
import * as utcNs from 'dayjs/plugin/utc';
import * as timezoneNs from 'dayjs/plugin/timezone';
import * as isSameOrBeforeNs from 'dayjs/plugin/isSameOrBefore';
import * as isSameOrAfterNs from 'dayjs/plugin/isSameOrAfter';
import * as customParseFormatNs from 'dayjs/plugin/customParseFormat';
import type { PluginFunc } from 'dayjs';

/** Bun/ESM may expose CJS as `{ default: fn }`; Nest/CJS may expose the fn on the namespace. */
function unwrap<T>(mod: T | { default: T }): T {
  if (typeof mod === 'function') return mod;
  if (mod && typeof (mod as { default?: unknown }).default === 'function') {
    return (mod as { default: T }).default;
  }
  return mod as T;
}

const dayjs = unwrap(dayjsNs);
dayjs.extend(unwrap(utcNs) as PluginFunc);
dayjs.extend(unwrap(timezoneNs) as PluginFunc);
dayjs.extend(unwrap(isSameOrBeforeNs) as PluginFunc);
dayjs.extend(unwrap(isSameOrAfterNs) as PluginFunc);
dayjs.extend(unwrap(customParseFormatNs) as PluginFunc);

export default dayjs;
export type { Dayjs } from 'dayjs';
