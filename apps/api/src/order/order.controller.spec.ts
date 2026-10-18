import { Test, TestingModule } from '@nestjs/testing';
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
import { DelhiveryService } from '../delhivery/delhivery.service';
import { OrderStatusSyncService } from '../delhivery/order-status-sync.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { PopularityService } from '../popularity/popularity.service';
import { CompanyInfoService } from '../setting/company-info/company-info.service';
import { InventoryService } from '../inventory/inventory.service';
import { FileService } from '../file/file.service';
import { PrescriptionService } from '../prescription/prescription.service';
import { OrderManifestService } from './order-manifest.service';
import { createPrismaServiceMock } from '../test-utils/prisma-mock';

describe('OrderController', () => {
  let controller: OrderController;

  const mockService = {};
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockService },
        { provide: CartService, useValue: mockService },
        { provide: PrismaService, useValue: createPrismaServiceMock() },
        { provide: CouponService, useValue: mockService },
        { provide: AddressService, useValue: mockService },
        { provide: ProductColorService, useValue: mockService },
        { provide: LensDetailService, useValue: mockService },
        { provide: LensFeatureService, useValue: mockService },
        { provide: PowerTypeService, useValue: mockService },
        { provide: DelhiveryService, useValue: mockService },
        { provide: OrderStatusSyncService, useValue: mockService },
        { provide: ActivityLoggerService, useValue: mockService },
        { provide: PopularityService, useValue: { recordPurchase: jest.fn() } },
        { provide: CompanyInfoService, useValue: { isCodEnabled: jest.fn() } },
        { provide: InventoryService, useValue: mockService },
        { provide: FileService, useValue: mockService },
        { provide: PrescriptionService, useValue: mockService },
        { provide: OrderManifestService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
