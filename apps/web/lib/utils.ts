import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import qs from "qs";
import { PATTERNS } from "./constants";

export const isValidObjectId = (value: string) => PATTERNS.mongo_id.test(value);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Plain text for meta description / Open Graph from CMS HTML. */
/** MRP discount badge: 100 * (listing - price) / listing, clamped 0–100. */
export function computeDiscountPercent(
  price: number | undefined | null,
  listingPrice: number | undefined | null,
): number {
  const p = Number(price);
  const listing = Number(listingPrice);
  if (!Number.isFinite(p) || !Number.isFinite(listing) || listing <= 0) {
    return 0;
  }
  if (p >= listing) return 0;
  const pct = (100 * (listing - p)) / listing;
  return Math.min(100, Math.max(0, Math.round(pct)));
}

export function stripHtmlForMeta(html: string | undefined | null): string {
  if (!html?.trim()) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function parse(value: string) {
  try {
    return JSON.parse(value);
  } catch (e) {
    console.error(e);
    return value;
  }
}
export const bytesToMB = (bytes: number): number => {
  try {
    return Number((bytes / 1024 / 1024).toFixed(2));
  } catch (e) {
    return 0;
  }
};

export const capitalizeFirstLetter = (string?: string): string => {
  try {
    if (string) {
      return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    }
    return "";
  } catch (err) {
    console.error(err);
    return "";
  }
};

export const convertTo12HourFormat = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);

  let formattedHours = hours % 12;
  if (formattedHours === 0) {
    formattedHours = 12;
  }

  const amOrPm = hours < 12 ? "AM" : "PM";

  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${amOrPm}`;
};

export type GenerateQueryStringParams = {
  [key: string]: string | string[] | number | undefined;
};
export const generateQueryString = (
  filters?: GenerateQueryStringParams,
): string => {
  const validFilters = () => {
    if (!filters) return {};
    return Object.keys(filters).reduce(
      (accumlator: GenerateQueryStringParams, key) => {
        const value = filters[key];
        const isEmpty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);
        if (!isEmpty) {
          accumlator[key] = value;
        }
        return accumlator;
      },
      {} as GenerateQueryStringParams,
    );
  };

  return qs.stringify(validFilters(), {
    arrayFormat: "brackets",
    skipNulls: true,
  });
};

export const formatNumber = (n: number): string => {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "m";
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "k";
  }
  return n.toString();
};

export const loadRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};
