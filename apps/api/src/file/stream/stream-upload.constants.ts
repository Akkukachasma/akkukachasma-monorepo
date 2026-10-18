export const STREAM_UPLOAD_LOG_CONTEXT = 'FileStreamUpload';

/** Human labels for machine-facing codes (HTTP responses & logs). */
export const STREAM_ERROR_MESSAGES: Record<string, string> = {
  STREAM_SESSION_NOT_FOUND: 'Upload session not found.',
  STREAM_SESSION_EXPIRED: 'Upload session has expired.',
  STREAM_NOT_OWNER: 'You do not have access to this upload.',
  STREAM_INVALID_STATE: 'This action is not allowed for the current upload state.',
  STREAM_INVALID_CHUNK_INDEX: 'Chunk index is out of range.',
  STREAM_CHUNK_TOO_LARGE: 'Chunk exceeds the maximum allowed size (10MB).',
  STREAM_DUPLICATE_CHUNK_MISMATCH:
    'The same chunk index was already stored with a different size.',
  STREAM_MISSING_CHUNKS: 'One or more chunks are missing before completion.',
  STREAM_CHUNK_SIZE_MISMATCH: 'Stored chunk size does not match expected size.',
  STREAM_MERGE_RACE: 'Another request is already finalizing this upload.',
  STREAM_MERGE_FAILED: 'Merging or uploading the file to storage failed.',
  STREAM_UNSUPPORTED_MIME: 'This file type is not allowed for large uploads.',
  STREAM_INVALID_MULTIPART: 'Invalid multipart payload for chunk upload.',
  STREAM_BAD_TOTALS: 'File must be 10MB or smaller (or chunk count is invalid).',
  STREAM_CANCELLED: 'Upload was cancelled.',
};

export const DEFAULT_STREAM_ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/octet-stream',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
];
