/**
 * Format stored mobile for display (e.g. invoice, order views).
 * Returns null when missing or not parseable as a useful number.
 */
export function formatIndianPhone(phone?: string | null): string | null {
  const raw = phone?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  const last10 = digits.length > 10 ? digits.slice(-10) : digits;
  if (last10.length >= 10) return `+91 ${last10}`;
  if (digits.length > 0) return `+91 ${digits}`;
  return null;
}
