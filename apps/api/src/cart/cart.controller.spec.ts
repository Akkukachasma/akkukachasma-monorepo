import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { PrescriptionService } from '../prescription/prescription.service';
import { CouponService } from '../coupon/coupon.service';
import { InventoryService } from '../inventory/inventory.service';
import { OrderService } from '../order/order.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { createMockConfigService } from '../test/mock-config.service';
import { PopularityService } from '../popularity/popularity.service';

describe('CartController', () => {
  let controller: CartController;
  const mockService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        CartService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
        { provide: PrescriptionService, useValue: mockService },
        { provide: CouponService, useValue: mockService },
        { provide: InventoryService, useValue: {} },
        { provide: OrderService, useValue: {} },
        { provide: ActivityLoggerService, useValue: {} },
        { provide: ConfigService, useValue: createMockConfigService() },
        { provide: PopularityService, useValue: { recordAddToCart: jest.fn() } },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
