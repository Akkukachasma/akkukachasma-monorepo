import { IGlasses, IGlassTypeData } from "@/lib/types";

export const TOKENS = {
  AUTH_TOKEN: "_akat",
  REFRESH_TOKEN: "_akrt",
};

export const PATTERNS = {
  hex_color: /^#[0-9A-F]{6}[0-9a-f]{0,2}$/i,
  mongo_id: /^[0-9a-fA-F]{24}$/,
};

export const PUBLIC_ROUTES = ["/manage", "/login"];

/** Base path for operator (admin/staff) area. */
export const MANAGE_BASE = "/manage";

/** Role codes that can access /manage (admin and staff). */
export const MANAGE_ROLE_CODES = ["admin", "staff"];

/** Role code for customer area. */
export const CUSTOMER_ROLE_CODES = ["customer"];

/** Path prefixes for customers userland (account, orders, addresses, etc.). Used for layout/documentation. */
export const CUSTOMERS_USERLAND_PREFIXES = ["/customers"];

/** Path prefixes for customer-only routes (under /customers and shared paths). Used by protect() and isCustomerPath. */
export const CUSTOMER_PATH_PREFIXES = [
  "/customers",
  "/cart",
  "/checkout",
  "/wishlist",
];

/** Path prefixes that guests can access without logging in. */
export const GUEST_ALLOWED_PREFIXES = ["/cart", "/checkout"];

export const GlassData: IGlasses[] = [
  { src: "images/1 (11).jpeg", title: "Aviator" },
  { src: "images/1 (12).jpeg", title: "Butterfly" },
  { src: "images/1 (13).jpeg", title: "Butterfly eyeglasses " },
  { src: "images/1 (14).jpeg", title: "Cat eye" },
  { src: "images/1 (15).jpeg", title: "Geometric" },
  { src: "images/1 (16).jpeg", title: "Half frame rectangle" },
  { src: "images/1 (17).jpeg", title: "Oval" },
  { src: "images/1 (18).jpeg", title: "Round" },
  { src: "images/1 (19).jpeg", title: "Square" },
  { src: "images/1 (20).jpeg", title: "Wayfarer" },
];

export const GlassTypesData: IGlassTypeData[] = [
  {
    src: "images/sunglasses.png",
    title: "Sun Glasses",
  },
  {
    src: "images/eyeglasses.png",
    title: "Eye Glasses",
  },
  {
    src: "images/ComputerGlasses.png",
    title: "Computer Glasses",
  },
  {
    src: "images/buytoguide.png",
    title: "Buy To Guide",
  },
  {
    src: "images/readingglass.png",
    title: "Reading Glasses",
  },
  {
    src: "images/prescriptionglasses.jpeg",
    title: "Prescription Glasses",
  },
  {
    src: "images/offer99.png",
    title: "Offer 99",
  },
];

export const IMAGE_RATIO = {
  ratio_33x9: {
    ratio: [33, 9],
    class: "aspect-[33/9]",
  },
  ratio_21x9: {
    ratio: [21, 9],
    class: "aspect-[21/9]",
  },
  ratio_16x9: {
    ratio: [16, 9],
    class: "aspect-[16/9]",
  },
  ratio_7x3: {
    ratio: [7, 3],
    class: "aspect-[7/3]",
  },
  ratio_8x3: {
    ratio: [8, 3],
    class: "aspect-[8/3]",
  },
  ratio_5x3: {
    ratio: [5, 3],
    class: "aspect-[5/3]",
  },
  ratio_4x3: {
    ratio: [4, 3],
    class: "aspect-[4/3]",
  },
  ratio_13x1: {
    ratio: [13, 1],
    class: "aspect-[13/1]",
  },
  ratio_1x1: {
    ratio: [1, 1],
    class: "aspect-[1/1]",
  },
  auto: {
    ratio: ["auto", "auto"],
    class: "aspect-[7/3]",
  },
};
