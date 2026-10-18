import { describe, expect, it } from "vitest";
import {
  formatGstAmount,
  formatGstRoundedByPaise,
  normalizeGstBreakdown,
  truncate,
} from "./order-summary-gst";

describe("order-summary-gst", () => {
  it("truncates toward zero for positive amounts (no rounding up)", () => {
    expect(truncate(66.666, 2)).toBe(66.66);
    expect(truncate(99.999, 2)).toBe(99.99);
  });

  it("formatGstAmount matches truncated two-decimal string", () => {
    expect(formatGstAmount(33.335)).toBe("33.33");
    expect(formatGstAmount(66.666)).toBe("66.66");
  });

  it("normalizeGstBreakdown fills missing fields from total GST", () => {
    expect(normalizeGstBreakdown(undefined, 12)).toEqual({
      total_gst: 12,
      cgst: 0,
      sgst: 0,
      igst: 12,
      rounded_by: 0,
    });
  });

  it("normalizeGstBreakdown preserves explicit CGST/SGST", () => {
    expect(
      normalizeGstBreakdown(
        { total_gst: 66.66, cgst: 33.33, sgst: 33.33, igst: 0 },
        66.66,
      ),
    ).toEqual({
      total_gst: 66.66,
      cgst: 33.33,
      sgst: 33.33,
      igst: 0,
      rounded_by: 0,
    });
  });

  it("normalizeGstBreakdown passes rounded_by in paise", () => {
    expect(
      normalizeGstBreakdown(
        { total_gst: 114, cgst: 57, sgst: 57, igst: 0, rounded_by: 28 },
        114,
      ).rounded_by,
    ).toBe(28);
  });

  it("formatGstRoundedByPaise signs match invoice convention", () => {
    expect(formatGstRoundedByPaise(28)).toBe("+ ₹0.28");
    expect(formatGstRoundedByPaise(-49)).toBe("− ₹0.49");
    expect(formatGstRoundedByPaise(0)).toBe("₹ 0.00");
  });
});
