import * as bcrypt from 'bcryptjs';
import dayjs from './custom-dayjs';
import { Response } from 'express';
import { GUEST_SESSION_MAX_AGE, MAX_AGES, TOKENS } from './constants';
import { ICalculation } from '../src/cart/type';

export type CookieEnv = {
  isDevEnvironment: boolean;
  productionCookieDomain?: string;
};

/** Derive cookie domain behavior from DEV_ENVIRONMENT (JSON boolean or `"true"`). */
export function cookieEnvFromDevEnvironmentString(
  raw: string | undefined,
): CookieEnv {
  let isDevEnvironment = false;
  try {
    isDevEnvironment = JSON.parse(raw ?? 'false');
  } catch {
    isDevEnvironment = raw === 'true';
  }
  return { isDevEnvironment, productionCookieDomain: '.akkukachasma.com' };
}

/** Shared cookie options used for both set and clear. Must match for clearCookie to work reliably. */
const getCookieOptions = (
  cookieEnv: CookieEnv,
  overrides?: { domain?: string },
) => ({
  path: '/',
  httpOnly: true,
  sameSite: 'none' as const,
  secure: true,
  ...(!cookieEnv.isDevEnvironment && {
    domain:
      overrides?.domain ??
      cookieEnv.productionCookieDomain ??
      '.akkukachasma.com',
  }),
});

export const hashString = async (password: string): Promise<string> => {
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

export const compareString = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const setCookie = (
  response: Response,
  {
    data,
    age,
    name,
  }: { data: any; age?: number; name?: string },
  cookieEnv: CookieEnv,
): void => {
  response.cookie(name ?? TOKENS.auth_token, data, {
    ...getCookieOptions(cookieEnv),
    maxAge: age ?? MAX_AGES[TOKENS.auth_token],
  });
};

export const removeCookie = (
  response: Response,
  name: string | undefined,
  cookieEnv: CookieEnv,
): void => {
  response.clearCookie(name ?? TOKENS.auth_token, {
    ...getCookieOptions(cookieEnv),
  });
};

// collects working duration details from the querystring value
// IMPORTANT for filtering employees based on their working duration
export const transformDurationString = (str: string): any => {
  try {
    return [
      str
        .split(',')
        .filter((item) => item.includes('month'))
        .map((item) => Number(item.slice(0, 1))),

      str
        .split(',')
        .filter((item) => item.includes('year'))
        .map((item) => Number(item.slice(0, 1))),

      str.includes('5plus') ? ['5plus'] : [],
    ];
  } catch (error) {
    return null;
  }
};

export const isValidDateString = (
  dateStr: string,
  format: string = 'YYYY-MM-DD',
) => {
  return dayjs(dateStr, format, true).isValid();
};

export const calculateAverage = (data: number[]) => {
  return data.reduce((a, b) => a + b) / data.length;
};

export const getNameDetails = (name: string) => {
  const nameObj: {
    first_name: string;
    middle_name?: string;
    last_name: string;
  } = {
    first_name: '',
    last_name: '',
  };
  if (name) {
    const nameArr = name?.split(' ');
    if (Array.isArray(nameArr) && nameArr.length === 1) {
      nameObj.first_name = nameArr[0];
    } else if (Array.isArray(nameArr) && nameArr.length === 2) {
      nameObj.first_name = nameArr[0];
      nameObj.last_name = nameArr[1];
    } else if (Array.isArray(nameArr) && nameArr.length === 3) {
      nameObj.first_name = nameArr[0];
      nameObj.middle_name = nameArr[1];
      nameObj.last_name = nameArr[2];
    }
  }

  return nameObj;
};

export const isDateInRange = (
  start_date: string | Date,
  end_date: string | Date,
  date: string | Date,
): boolean => {
  const startDate = dayjs.utc(dayjs(start_date).format('YYYY-MM-DD'));
  const endDate = dayjs.utc(dayjs(end_date).format('YYYY-MM-DD'));
  const dateToCheck = dayjs.utc(dayjs(date).format('YYYY-MM-DD'));
  return (
    dateToCheck.isSameOrAfter(startDate) && dateToCheck.isSameOrBefore(endDate)
  );
};

export const getDatesBetweenDates = (
  start: Date = dayjs().toDate(),
  end: Date = dayjs().toDate(),
) => {
  try {
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const datesArray = [];

    let currentDate = startDate;
    while (currentDate.isSameOrBefore(endDate)) {
      datesArray.push(currentDate.format('YYYY-MM-DD'));
      currentDate = currentDate.add(1, 'day');
    }

    return datesArray;
  } catch (error) {
    return [];
  }
};
export const getContractExpiryDate = ({
  start_work,
  type,
  duration,
}: {
  start_work: Date;
  type: 'month' | 'year' | 'week';
  duration: number;
}) => {
  try {
    const date = dayjs(start_work).add(duration, type).format();
    if (date === 'Invalid Date') {
      throw new Error('Invalid arguements provided');
    }
    return dayjs(date).toDate();
  } catch (error) {
    return null;
  }
};

export const base64ToUint8Array = (base64: string) => {
  const raw = atob(base64.split(',')[1]);
  const uint8Array = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    uint8Array[i] = raw.charCodeAt(i);
  }
  return uint8Array;
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
};

export const calculateGST = (total: number, gst: number) => {
  const gst_amount = Number((total * (gst / 100)).toFixed(2));
  return {
    gst,
    gst_amount,
    total: total + gst_amount,
  };
};

export const percentToAbsolute = (total: number, percentage: number) => {
  return (total * percentage) / 100;
};

export const calculateTotal = (
  calculation: ICalculation,
  coupon_discount: number,
) => {
  return Number(
    (
      calculation.subtotal +
      calculation.lens_detail_price -
      (coupon_discount + calculation.discount_on_mrp)
    ).toFixed(2),
  );
};

/**
 * MRP discount: 100 * (listing_price - price) / listing_price
 * Clamped to [0, 100]. Returns 0 when listing_price is missing or invalid.
 */
export function computeDiscountPercent(
  price: number,
  listingPrice: number,
): number {
  const p = Number(price);
  const listing = Number(listingPrice);
  if (!Number.isFinite(p) || !Number.isFinite(listing) || listing <= 0) {
    return 0;
  }
  if (p >= listing) return 0;
  const pct = (100 * (listing - p)) / listing;
  return Math.min(100, Math.max(0, Math.round(pct * 100) / 100));
}
