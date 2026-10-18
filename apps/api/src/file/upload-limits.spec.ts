import {
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  formatMaxUploadLabel,
  isWithinUploadLimit,
  uploadLimitExceededMessage,
} from './upload-limits';

describe('upload-limits', () => {
  it('exports a 10MB byte cap', () => {
    expect(MAX_UPLOAD_BYTES).toBe(10 * 1024 * 1024);
    expect(MAX_UPLOAD_MB).toBe(10);
    expect(formatMaxUploadLabel()).toBe('10MB');
    expect(uploadLimitExceededMessage()).toContain('10MB');
  });

  it('accepts sizes within the limit', () => {
    expect(isWithinUploadLimit(0)).toBe(true);
    expect(isWithinUploadLimit(MAX_UPLOAD_BYTES)).toBe(true);
    expect(isWithinUploadLimit(MAX_UPLOAD_BYTES - 1)).toBe(true);
  });

  it('rejects sizes over the limit', () => {
    expect(isWithinUploadLimit(MAX_UPLOAD_BYTES + 1)).toBe(false);
    expect(isWithinUploadLimit(-1)).toBe(false);
    expect(isWithinUploadLimit(Number.NaN)).toBe(false);
  });
});
