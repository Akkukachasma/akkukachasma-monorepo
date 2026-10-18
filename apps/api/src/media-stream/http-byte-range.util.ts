/**
 * Parse a single `Range: bytes=…` value against a known object size (S3 Content-Length).
 */
export type ByteRangeParseResult =
  | { kind: 'full' }
  | { kind: 'partial'; start: number; end: number }
  | { kind: 'unsatisfiable' }
  | { kind: 'malformed' };

export function parseByteRangeHeader(
  rangeHeader: string | undefined,
  totalSize: number,
): ByteRangeParseResult {
  if (rangeHeader === undefined || rangeHeader.trim() === '') {
    return { kind: 'full' };
  }

  const trimmed = rangeHeader.trim();
  if (!/^bytes=/i.test(trimmed)) {
    return { kind: 'malformed' };
  }

  if (totalSize <= 0) {
    return { kind: 'unsatisfiable' };
  }

  const spec = trimmed.slice(trimmed.indexOf('=') + 1).split(',')[0].trim();
  const dashIndex = spec.indexOf('-');
  if (dashIndex === -1) {
    return { kind: 'malformed' };
  }

  const startPart = spec.slice(0, dashIndex);
  const endPart = spec.slice(dashIndex + 1);

  if (startPart === '' && endPart === '') {
    return { kind: 'malformed' };
  }

  if (startPart === '') {
    const suffixLen = parseInt(endPart, 10);
    if (!Number.isFinite(suffixLen) || suffixLen <= 0) {
      return { kind: 'malformed' };
    }
    const start = Math.max(0, totalSize - suffixLen);
    return { kind: 'partial', start, end: totalSize - 1 };
  }

  const start = parseInt(startPart, 10);
  if (!Number.isFinite(start)) {
    return { kind: 'malformed' };
  }
  if (start >= totalSize) {
    return { kind: 'unsatisfiable' };
  }

  let end: number;
  if (endPart === '') {
    end = totalSize - 1;
  } else {
    const parsedEnd = parseInt(endPart, 10);
    if (!Number.isFinite(parsedEnd)) {
      return { kind: 'malformed' };
    }
    if (parsedEnd < start) {
      return { kind: 'malformed' };
    }
    end = Math.min(parsedEnd, totalSize - 1);
  }

  return { kind: 'partial', start, end };
}

export function s3RangeHeader(start: number, end: number): string {
  return `bytes=${start}-${end}`;
}
