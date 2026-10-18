import { ConfigService } from '@nestjs/config';
import { FileStreamConfigService } from './file-stream-config.service';
import { MAX_UPLOAD_BYTES } from '../upload-limits';

describe('FileStreamConfigService', () => {
  it('defaults max file and chunk bytes to MAX_UPLOAD_BYTES', () => {
    const config = {
      get: jest.fn().mockReturnValue(undefined),
    } as unknown as ConfigService;
    const svc = new FileStreamConfigService(config);
    expect(svc.maxFileBytes).toBe(MAX_UPLOAD_BYTES);
    expect(svc.maxChunkBytes).toBe(MAX_UPLOAD_BYTES);
  });

  it('never allows configured max above MAX_UPLOAD_BYTES', () => {
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'STREAM_UPLOAD_MAX_FILE_BYTES') {
          return String(500 * 1024 * 1024);
        }
        if (key === 'STREAM_UPLOAD_MAX_CHUNK_BYTES') {
          return String(16 * 1024 * 1024);
        }
        return undefined;
      }),
    } as unknown as ConfigService;
    const svc = new FileStreamConfigService(config);
    expect(svc.maxFileBytes).toBe(MAX_UPLOAD_BYTES);
    expect(svc.maxChunkBytes).toBe(MAX_UPLOAD_BYTES);
  });
});
