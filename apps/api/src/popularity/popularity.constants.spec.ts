import { computePopularityScore } from './popularity.constants';

describe('computePopularityScore', () => {
  it('applies documented weights', () => {
    const score = computePopularityScore({
      views: 10,
      times_liked: 5,
      times_added_to_cart: 2,
      times_shared: 1,
      times_purchased: 4,
    });
    expect(score).toBeCloseTo(
      10 * 0.1 + 5 * 0.2 + 2 * 0.3 + 1 * 0.4 + 4 * 0.5,
    );
  });

  it('returns zero for empty counts', () => {
    expect(
      computePopularityScore({
        views: 0,
        times_liked: 0,
        times_added_to_cart: 0,
        times_shared: 0,
        times_purchased: 0,
      }),
    ).toBe(0);
  });
});
