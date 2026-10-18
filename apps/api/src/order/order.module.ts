import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartService } from '../cart/cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { CouponService } from '../coupon/coupon.service';
import { AddressService } from '../address/address.service';
import { ProductColorService } from '../product/product-color/product-color.service';
import { LensDetailService } from '../lens-detail/lens-detail.service';
import { LensFeatureService } from '../lens-feature/lens-feature.service';
import { PowerTypeService } from '../power-type/power-type.service';
import { PincodeService } from '../address/pincode.service';
import { OwnershipResolverRegistry } from '../rbac/services/ownership-resolver.registry';
import {
  OrderOwnershipResolver,
  ORDER_RESOURCE_TYPE,
} from './order-ownership.resolver';
import { InventoryModule } from '../inventory/inventory.module';
import { DelhiveryModule } from '../delhivery/delhivery.module';
import { PopularityModule } from '../popularity/popularity.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { CompanyInfoModule } from '../setting/company-info/company-info.module';
import { NotificationModule } from '../notifications/notifications.module';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { PrescriptionModule } from '../prescription/prescription.module';
import { OrderManifestService } from './order-manifest.service';

@Module({
  imports: [
    InventoryModule,
    DelhiveryModule,
    PopularityModule,
    forwardRef(() => InvoiceModule),
    CompanyInfoModule,
    NotificationModule,
    PrescriptionModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrderManifestService,
    OrderOwnershipResolver,
    CartService,
    PrismaService,
    CouponService,
    AddressService,
    ProductColorService,
    LensDetailService,
    LensFeatureService,
    PowerTypeService,
    PincodeService,
    FileService,
    BucketService,
  ],
  exports: [OrderService, CartService],
})
export class OrderModule implements OnModuleInit {
  constructor(
    private readonly ownershipRegistry: OwnershipResolverRegistry,
    private readonly orderOwnershipResolver: OrderOwnershipResolver,
  ) {}

  onModuleInit() {
    this.ownershipRegistry.register(ORDER_RESOURCE_TYPE, this.orderOwnershipResolver);
  }
}
