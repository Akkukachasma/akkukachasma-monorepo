/** Weights for ProductColor popularity score (see Popularity model). */
export const POPULARITY_WEIGHTS = {
  views: 0.1,
  times_liked: 0.2,
  times_added_to_cart: 0.3,
  times_shared: 0.4,
  times_purchased: 0.5,
} as const;

export type PopularityCounts = {
  views: number;
  times_liked: number;
  times_added_to_cart: number;
  times_shared: number;
  times_purchased: number;
};

export function computePopularityScore(c: PopularityCounts): number {
  return (
    c.views * POPULARITY_WEIGHTS.views +
    c.times_liked * POPULARITY_WEIGHTS.times_liked +
    c.times_added_to_cart * POPULARITY_WEIGHTS.times_added_to_cart +
    c.times_shared * POPULARITY_WEIGHTS.times_shared +
    c.times_purchased * POPULARITY_WEIGHTS.times_purchased
  );
}
