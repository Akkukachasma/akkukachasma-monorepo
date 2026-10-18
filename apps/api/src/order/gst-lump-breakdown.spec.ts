import {
  computeGstLumpBreakdown,
  splitLineGstIntoCgstSgst,
  stripCurrency,
} from './gst-lump-breakdown';

describe('computeGstLumpBreakdown', () => {
  it('intra even paise: no rounding, equal halves', () => {
    const b = computeGstLumpBreakdown(114.28, true);
    expect(b.total_gst).toBe(114.28);
    expect(b.cgst).toBe(57.14);
    expect(b.sgst).toBe(57.14);
    expect(b.igst).toBe(0);
    expect(b.rounded_by).toBe(0);
  });

  it('intra odd paise: rounds to rupee and sets rounded_by paise', () => {
    const b = computeGstLumpBreakdown(114.27, true);
    expect(b.total_gst).toBe(114);
    expect(b.cgst).toBe(57);
    expect(b.sgst).toBe(57);
    expect(b.rounded_by).toBe(27);
  });

  it('intra odd rounds up when nearer upper rupee', () => {
    const b = computeGstLumpBreakdown(114.51, true);
    expect(b.total_gst).toBe(115);
    expect(b.rounded_by).toBe(-49);
  });

  it('inter-state: full IGST, no rounding flag', () => {
    const b = computeGstLumpBreakdown(200.33, false);
    expect(b.total_gst).toBe(200.33);
    expect(b.igst).toBe(200.33);
    expect(b.cgst).toBe(0);
    expect(b.sgst).toBe(0);
    expect(b.rounded_by).toBe(0);
  });
});

describe('splitLineGstIntoCgstSgst', () => {
  it('splits with remainder on SGST', () => {
    const { cgst, sgst } = splitLineGstIntoCgstSgst(114.27);
    expect(cgst + sgst).toBeCloseTo(114.27, 5);
    expect(stripCurrency(cgst + sgst)).toBe(114.27);
  });
});
