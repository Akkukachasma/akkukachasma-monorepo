/** Raw base64 from API / form → safe `img` src (supports legacy `data:` payloads). */
export function signatureDataUrl(
  raw: string | null | undefined,
): string | null {
  if (!raw || !String(raw).trim()) return null;
  const s = String(raw).trim();
  if (s.startsWith("data:")) return s;
  return `data:image/png;base64,${s}`;
}
