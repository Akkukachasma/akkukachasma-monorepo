/** Max size for every user-facing file upload (multipart + stream). Keep in sync with backend/src/file/upload-limits.ts */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_MB = 10;

export function formatMaxUploadLabel(): string {
  return `${MAX_UPLOAD_MB}MB`;
}

export function isWithinUploadLimit(size: number): boolean {
  return Number.isFinite(size) && size >= 0 && size <= MAX_UPLOAD_BYTES;
}

export function uploadLimitExceededMessage(): string {
  return `File must be ${formatMaxUploadLabel()} or smaller`;
}
