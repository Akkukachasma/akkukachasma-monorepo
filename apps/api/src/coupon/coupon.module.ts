import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponCrons } from './coupon.crons';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notifications/notifications.module';
import { CartService } from '../cart/cart.service';

@Module({
  imports: [NotificationModule],
  controllers: [CouponController],
  providers: [CouponService, CouponCrons, CartService, PrismaService],
  exports: [CouponService],
})
export class CouponModule {}
