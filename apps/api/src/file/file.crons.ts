import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';

@Injectable()
export class FileCrons {
  private readonly logger = new Logger(FileCrons.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bucketService: BucketService,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanTempFiles() {
    try {
      const temp_files = await this.prisma.file.findMany({
        where: {
          is_temp: true,
          created_at: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      });
      const count = temp_files.length;
      await this.prisma.$transaction(async (prisma) => {
        await prisma.file.deleteMany({
          where: {
            id: {
              in: temp_files.map((file) => file.id),
            },
          },
        });
        await this.bucketService.removeMany(temp_files.map((file) => file.key));
      });
      this.activityLogger.logSuccess(
        'File cron: temp files cleaned',
        `Cleaned ${count} temporary file(s)`,
        { source: 'file_cron', job: 'cleanTempFiles', count },
      );
    } catch (error: any) {
      this.logger.error('Error while cleaning temporary file uploads', error?.stack);
      this.activityLogger.logError(
        'File cron: temp files cleanup failed',
        error?.message,
        { source: 'file_cron', job: 'cleanTempFiles', error: error?.message },
      );
    }
  }
}
