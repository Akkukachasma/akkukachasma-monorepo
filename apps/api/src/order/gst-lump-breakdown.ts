/**
 * Shared lump-sum GST → CGST/SGST (intra) or IGST (inter), with odd-paise rupee rounding.
 * Used by OrderService (checkout) and InvoiceService (tax invoices).
 */

export type GstLumpBreakdown = {
  total_gst: number;
  cgst: number;
  sgst: number;
  igst: number;
  /** Paise: computed lump − invoice total GST; + = rounded down, − = rounded up. */
  rounded_by: number;
};

/** Truncate to 2 decimals (strip); do not round up. */
export function stripCurrency(value: number): number {
  const v = Number(value) || 0;
  const sign = v < 0 ? -1 : 1;
  const abs = Math.abs(v);
  return sign * (Math.floor(abs * 100 + 1e-9) / 100);
}

/**
 * When intra-state total GST in paise is odd, round total to nearest rupee so CGST === SGST in rupees.
 */
export function computeGstLumpBreakdown(
  totalGst: number,
  isIntraState: boolean,
): GstLumpBreakdown {
  const strippedTotalGst = stripCurrency(totalGst || 0);
  const totalPaise = Math.round(strippedTotalGst * 100 + Number.EPSILON);

  if (!totalPaise) {
    return {
      total_gst: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      rounded_by: 0,
    };
  }

  if (isIntraState) {
    const needsRupeeRound = totalPaise % 2 === 1;
    const gstForSplit = needsRupeeRound
      ? Math.round(strippedTotalGst)
      : strippedTotalGst;
    const invoicePaise = Math.round(gstForSplit * 100 + Number.EPSILON);
    const rounded_by = needsRupeeRound ? totalPaise - invoicePaise : 0;

    const totalForBreakdown = stripCurrency(gstForSplit);
    const half = stripCurrency(totalForBreakdown / 2);
    return {
      total_gst: totalForBreakdown,
      cgst: half,
      sgst: stripCurrency(totalForBreakdown - half),
      igst: 0,
      rounded_by,
    };
  }

  return {
    total_gst: strippedTotalGst,
    cgst: 0,
    sgst: 0,
    igst: strippedTotalGst,
    rounded_by: 0,
  };
}

/** Split a single line’s GST amount into CGST + SGST (truncate, remainder on SGST). */
export function splitLineGstIntoCgstSgst(gstLineAmount: number): {
  cgst: number;
  sgst: number;
} {
  const a = stripCurrency(gstLineAmount || 0);
  if (!a) return { cgst: 0, sgst: 0 };
  const half = stripCurrency(a / 2);
  return { cgst: half, sgst: stripCurrency(a - half) };
}
