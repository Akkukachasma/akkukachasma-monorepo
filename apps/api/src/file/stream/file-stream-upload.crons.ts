import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FileStreamUploadService } from './file-stream-upload.service';
import { STREAM_UPLOAD_LOG_CONTEXT } from './stream-upload.constants';

@Injectable()
export class FileStreamUploadCrons {
  private readonly logger = new Logger(STREAM_UPLOAD_LOG_CONTEXT);

  constructor(private readonly uploads: FileStreamUploadService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredSessions() {
    try {
      await this.uploads.cleanupStaleSessionsCron();
    } catch (e: unknown) {
      this.logger.error(
        JSON.stringify({
          msg: 'stream_upload_cron_failed',
          error: String((e as Error)?.message ?? e),
        }),
      );
    }
  }
}
