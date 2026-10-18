import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ObjectId } from 'bson';
import { FileStreamConfigService } from './file-stream-config.service';
import { STREAM_UPLOAD_LOG_CONTEXT } from './stream-upload.constants';

export function sanitizeUploadSegment(id: string): string {
  if (!ObjectId.isValid(id)) {
    throw new BadRequestException({
      success: false,
      code: 'STREAM_INVALID_UPLOAD_ID',
      message: 'Invalid upload identifier.',
      type: 'stream_upload',
    });
  }
  return id;
}

export function chunkFileName(chunkIndex: number): string {
  return `chunk_${String(chunkIndex).padStart(8, '0')}`;
}

@Injectable()
export class FileStreamLocalStorageService {
  private readonly logger = new Logger(STREAM_UPLOAD_LOG_CONTEXT);

  constructor(private readonly streamConfig: FileStreamConfigService) {}

  uploadsBaseDir(): string {
    return path.join(this.streamConfig.tempRootAbs, 'uploads');
  }

  absoluteSessionDir(uploadId: string): string {
    const id = sanitizeUploadSegment(uploadId);
    const base = path.resolve(this.uploadsBaseDir());
    const target = path.resolve(base, id);
    if (!target.startsWith(base + path.sep) && target !== base) {
      throw new InternalServerErrorException({
        message: 'Path traversal prevented',
        code: 'STREAM_STORAGE_PATH_INVALID',
      });
    }
    return target;
  }

  absoluteChunkPath(uploadId: string, chunkIndex: number): string {
    return path.join(
      this.absoluteSessionDir(uploadId),
      chunkFileName(chunkIndex),
    );
  }

  async ensureSessionDir(uploadId: string): Promise<void> {
    await fs.mkdir(this.absoluteSessionDir(uploadId), {
      recursive: true,
      mode: 0o700,
    });
  }

  async removeSessionDir(uploadId: string): Promise<void> {
    try {
      await fs.rm(this.absoluteSessionDir(uploadId), {
        recursive: true,
        force: true,
      });
      this.logger.log(
        JSON.stringify({
          msg: 'cleanup_completed_session_dir',
          uploadId,
        }),
      );
    } catch (e: any) {
      this.logger.error(
        JSON.stringify({
          msg: 'cleanup_session_dir_failed',
          uploadId,
          error: e?.message ?? String(e),
        }),
      );
    }
  }

  generateNewUploadIdHex(): string {
    return new ObjectId().toHexString();
  }
}
