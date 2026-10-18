/**
 * Display-only GST split (mirrors backend strip + half logic for line rows).
 */

function strip2(value: number): number {
  const v = Number(value) || 0;
  const sign = v < 0 ? -1 : 1;
  const abs = Math.abs(v);
  return sign * (Math.floor(abs * 100 + 1e-9) / 100);
}

/** Split one line’s GST into CGST + SGST for intra-state presentation. */
export function splitLineGstIntoCgstSgstForDisplay(gstLineAmount: number): {
  cgst: number;
  sgst: number;
} {
  const a = strip2(gstLineAmount || 0);
  if (!a) return { cgst: 0, sgst: 0 };
  const half = strip2(a / 2);
  return { cgst: half, sgst: strip2(a - half) };
}
