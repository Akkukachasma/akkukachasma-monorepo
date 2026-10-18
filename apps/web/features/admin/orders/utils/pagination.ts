/** Page numbers with ellipsis gaps for pagination controls. */
export function visiblePageItems(
  page: number,
  pageCount: number,
): (number | "ellipsis")[] {
  if (pageCount <= 1) return [1];
  const set = new Set<number>();
  set.add(1);
  set.add(pageCount);
  set.add(page);
  for (let p = page - 1; p <= page + 1; p++) {
    if (p >= 1 && p <= pageCount) set.add(p);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i]! - sorted[i - 1]! > 1) {
      out.push("ellipsis");
    }
    out.push(sorted[i]!);
  }
  return out;
}
