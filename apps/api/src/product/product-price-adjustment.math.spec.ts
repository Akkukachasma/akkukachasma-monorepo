import {
  PriceAdjustmentDirection,
  PriceAdjustmentMode,
} from '@prisma/client';
import {
  PRICE_FLOOR,
  applyPriceAdjustment,
} from './product-price-adjustment.math';

describe('applyPriceAdjustment', () => {
  const base = { listing_price: 1000, price: 800 };

  it('increases both prices by percentage', () => {
    const next = applyPriceAdjustment(base, {
      direction: PriceAdjustmentDirection.increase,
      mode: PriceAdjustmentMode.percentage,
      value: 10,
    });
    expect(next.listing_price).toBe(1100);
    expect(next.price).toBe(880);
    expect(next.clamped).toBe(false);
  });

  it('decreases both prices by percentage', () => {
    const next = applyPriceAdjustment(base, {
      direction: PriceAdjustmentDirection.decrease,
      mode: PriceAdjustmentMode.percentage,
      value: 10,
    });
    expect(next.listing_price).toBe(900);
    expect(next.price).toBe(720);
    expect(next.clamped).toBe(false);
  });

  it('increases by fixed amount', () => {
    const next = applyPriceAdjustment(base, {
      direction: PriceAdjustmentDirection.increase,
      mode: PriceAdjustmentMode.fixed,
      value: 50.5,
    });
    expect(next.listing_price).toBe(1050.5);
    expect(next.price).toBe(850.5);
    expect(next.clamped).toBe(false);
  });

  it('decreases by fixed amount', () => {
    const next = applyPriceAdjustment(base, {
      direction: PriceAdjustmentDirection.decrease,
      mode: PriceAdjustmentMode.fixed,
      value: 100,
    });
    expect(next.listing_price).toBe(900);
    expect(next.price).toBe(700);
    expect(next.clamped).toBe(false);
  });

  it('clamps to floor on 100% decrease', () => {
    const next = applyPriceAdjustment(base, {
      direction: PriceAdjustmentDirection.decrease,
      mode: PriceAdjustmentMode.percentage,
      value: 100,
    });
    expect(next.listing_price).toBe(PRICE_FLOOR);
    expect(next.price).toBe(PRICE_FLOOR);
    expect(next.clamped).toBe(true);
  });

  it('clamps when fixed decrease exceeds price', () => {
    const next = applyPriceAdjustment(
      { listing_price: 50, price: 40 },
      {
        direction: PriceAdjustmentDirection.decrease,
        mode: PriceAdjustmentMode.fixed,
        value: 100,
      },
    );
    expect(next.listing_price).toBe(PRICE_FLOOR);
    expect(next.price).toBe(PRICE_FLOOR);
    expect(next.clamped).toBe(true);
  });

  it('rounds to 2 decimal places', () => {
    const next = applyPriceAdjustment(
      { listing_price: 99.99, price: 33.33 },
      {
        direction: PriceAdjustmentDirection.increase,
        mode: PriceAdjustmentMode.percentage,
        value: 10,
      },
    );
    expect(next.listing_price).toBe(109.99);
    expect(next.price).toBe(36.66);
  });
});
