import {
  PriceAdjustmentDirection,
  PriceAdjustmentMode,
} from '@prisma/client';

export const PRICE_FLOOR = 0.01;

export function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export type PricePair = { listing_price: number; price: number };

export type AdjustedPricePair = PricePair & { clamped: boolean };

/**
 * Apply bulk price adjustment to a single product's listing + selling prices.
 */
export function applyPriceAdjustment(
  current: PricePair,
  opts: {
    direction: PriceAdjustmentDirection;
    mode: PriceAdjustmentMode;
    value: number;
  },
): AdjustedPricePair {
  const { direction, mode, value } = opts;
  let nextListing: number;
  let nextPrice: number;

  if (mode === PriceAdjustmentMode.percentage) {
    const factor =
      direction === PriceAdjustmentDirection.increase
        ? 1 + value / 100
        : 1 - value / 100;
    nextListing = roundMoney(Number(current.listing_price) * factor);
    nextPrice = roundMoney(Number(current.price) * factor);
  } else {
    const delta =
      direction === PriceAdjustmentDirection.increase ? value : -value;
    nextListing = roundMoney(Number(current.listing_price) + delta);
    nextPrice = roundMoney(Number(current.price) + delta);
  }

  const clampedListing = Math.max(PRICE_FLOOR, nextListing);
  const clampedPrice = Math.max(PRICE_FLOOR, nextPrice);
  const clamped =
    clampedListing !== nextListing || clampedPrice !== nextPrice;

  return {
    listing_price: roundMoney(clampedListing),
    price: roundMoney(clampedPrice),
    clamped,
  };
}
