import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';

@Injectable()
export class TokenCrons {
  private readonly logger = new Logger(TokenCrons.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanBlackListedTokens() {
    try {
      const result = await this.prisma.token.deleteMany({
        where: {
          exp: {
            lte: Date.now(),
          },
        },
      });
      const count = result.count;
      this.activityLogger.logSuccess(
        'Token cron: blacklisted tokens cleaned',
        `Removed ${count} expired blacklisted token(s)`,
        { source: 'token_cron', job: 'cleanBlackListedTokens', count },
      );
    } catch (error: any) {
      this.logger.error('Error while cleaning expired blacklisted tokens', error?.stack);
      this.activityLogger.logError(
        'Token cron: blacklisted tokens cleanup failed',
        error?.message,
        {
          source: 'token_cron',
          job: 'cleanBlackListedTokens',
          error: error?.message,
        },
      );
    }
  }
}
