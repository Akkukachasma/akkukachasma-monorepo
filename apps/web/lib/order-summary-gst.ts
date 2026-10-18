export type GstBreakdown = {
  total_gst: number;
  cgst: number;
  sgst: number;
  igst: number;
  /** Paise: positive = GST rounded down vs computed, negative = rounded up. */
  rounded_by: number;
};

export const formatAmount = (value: number) => Number(value || 0).toFixed(2);

/** GST line items: truncate (strip), do not round, so CGST+SGST matches total GST. */
export const truncate = (num: number, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return num < 0
    ? Math.ceil(num * factor) / factor
    : Math.floor(num * factor) / factor;
};

export const formatGstAmount = (value: number) =>
  truncate(Number(value || 0), 2).toFixed(2);

/**
 * Display GST invoice rounding in rupees from paise delta.
 * Positive rounded_by → show "+ ₹x.xx" (tax rounded down); negative → "− ₹x.xx".
 */
export const formatGstRoundedByPaise = (roundedByPaise: number): string => {
  const p = Math.trunc(Number(roundedByPaise) || 0);
  if (p === 0) return "₹ 0.00";
  const abs = (Math.abs(p) / 100).toFixed(2);
  return p > 0 ? `+ ₹${abs}` : `− ₹${abs}`;
};

export const normalizeGstBreakdown = (
  breakdown: Partial<GstBreakdown> | undefined,
  totalGst: number,
): GstBreakdown => {
  if (!breakdown) {
    return {
      total_gst: totalGst,
      cgst: 0,
      sgst: 0,
      igst: totalGst,
      rounded_by: 0,
    };
  }

  return {
    total_gst: Number(breakdown.total_gst ?? totalGst),
    cgst: Number(breakdown.cgst ?? 0),
    sgst: Number(breakdown.sgst ?? 0),
    igst: Number(breakdown.igst ?? 0),
    rounded_by: Math.trunc(Number(breakdown.rounded_by ?? 0)),
  };
};
