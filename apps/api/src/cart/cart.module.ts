import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { PrescriptionModule } from '../prescription/prescription.module';
import { CouponService } from '../coupon/coupon.service';
import { SettingModule } from '../setting/setting.module';
import { InventoryModule } from '../inventory/inventory.module';
import { OrderModule } from '../order/order.module';
import { PopularityModule } from '../popularity/popularity.module';

@Module({
  imports: [
    SettingModule,
    InventoryModule,
    OrderModule,
    PopularityModule,
    PrescriptionModule,
  ],
  controllers: [CartController],
  providers: [
    CartService,
    PrismaService,
    FileService,
    BucketService,
    CouponService,
  ],
})
export class CartModule {}
