import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CartService } from '../cart/cart.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';

@Injectable()
export class CouponCrons {
  private readonly logger = new Logger(CouponCrons.name);

  constructor(
    private readonly cartService: CartService,
    private readonly activityLogger: ActivityLoggerService,
  ) {}

  /** Release cart coupon reservations older than 24h that were never confirmed on an order. */
  @Cron(CronExpression.EVERY_HOUR)
  async releaseExpiredCartCoupons() {
    try {
      const count = await this.cartService.releaseExpiredCartCoupons();
      if (count > 0) {
        this.activityLogger.logSuccess(
          'Coupon cron: expired cart reservations released',
          `Released ${count} cart coupon reservation(s)`,
          {
            source: 'coupon_cron',
            job: 'releaseExpiredCartCoupons',
            count,
          },
        );
      }
    } catch (error: any) {
      this.logger.error(
        'Error while releasing expired cart coupons',
        error?.stack,
      );
      this.activityLogger.logError(
        'Coupon cron: expired cart reservation release failed',
        error?.message,
        {
          source: 'coupon_cron',
          job: 'releaseExpiredCartCoupons',
          error: error?.message,
        },
      );
    }
  }
}
