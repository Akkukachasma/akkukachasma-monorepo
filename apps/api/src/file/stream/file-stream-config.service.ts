import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { DEFAULT_STREAM_ALLOWED_MIMES } from './stream-upload.constants';
import { MAX_UPLOAD_BYTES } from '../upload-limits';

@Injectable()
export class FileStreamConfigService {
  readonly maxFileBytes: number;
  readonly maxChunkBytes: number;
  readonly sessionTtlMs: number;
  readonly tempRootAbs: string;
  readonly allowedMimeTypes: Set<string>;

  constructor(private readonly config: ConfigService) {
    const configuredMax = Number(
      this.config.get<string>('STREAM_UPLOAD_MAX_FILE_BYTES') ??
        String(MAX_UPLOAD_BYTES),
    );
    this.maxFileBytes = Math.min(
      Number.isFinite(configuredMax) && configuredMax > 0
        ? configuredMax
        : MAX_UPLOAD_BYTES,
      MAX_UPLOAD_BYTES,
    );

    const configuredChunk = Number(
      this.config.get<string>('STREAM_UPLOAD_MAX_CHUNK_BYTES') ??
        String(MAX_UPLOAD_BYTES),
    );
    const chunk =
      Number.isFinite(configuredChunk) && configuredChunk > 0
        ? configuredChunk
        : MAX_UPLOAD_BYTES;
    this.maxChunkBytes = Math.min(chunk, this.maxFileBytes);

    this.sessionTtlMs =
      Number(
        this.config.get<string>('STREAM_UPLOAD_SESSION_TTL_HOURS') ?? '24',
      ) *
      60 *
      60 *
      1000;
    const root =
      this.config.get<string>('STREAM_UPLOAD_TEMP_ROOT') ??
      path.join(process.cwd(), 'temp', 'uploads');
    this.tempRootAbs = path.resolve(root);

    const envList = this.config.get<string>('STREAM_UPLOAD_ALLOWED_MIMES');
    const list = envList
      ? envList
          .split(',')
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : DEFAULT_STREAM_ALLOWED_MIMES.map((m) => m.toLowerCase());
    this.allowedMimeTypes = new Set(list);
  }
}
