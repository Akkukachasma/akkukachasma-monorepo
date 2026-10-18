/**
 * Builds a compact page list for pagination UI (e.g. 1 … 5 6 7 … 20).
 */
export function getPaginationRange(
  current: number,
  total: number,
  delta = 1,
): (number | "ellipsis")[] {
  if (total < 1) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const range: (number | "ellipsis")[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("ellipsis");
  for (let i = left; i <= right; i += 1) {
    range.push(i);
  }
  if (right < total - 1) range.push("ellipsis");
  range.push(total);
  return range;
}
