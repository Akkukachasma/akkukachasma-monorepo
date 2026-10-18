import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryService } from '../inventory/inventory.service';
import { PincodeService } from '../address/pincode.service';
import { PopularityService } from '../popularity/popularity.service';
import { InvoiceService } from '../invoice/invoice.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { CartService } from '../cart/cart.service';
import { CouponService } from '../coupon/coupon.service';
import { createPrismaServiceMock } from '../test-utils/prisma-mock';

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: createPrismaServiceMock() },
        { provide: InventoryService, useValue: {} },
        { provide: PincodeService, useValue: {} },
        { provide: PopularityService, useValue: { recordPurchase: jest.fn() } },
        { provide: InvoiceService, useValue: {} },
        {
          provide: NotificationsDispatchService,
          useValue: {
            notifyResourceMutation: jest.fn().mockResolvedValue(undefined),
            notifyPortalUsers: jest.fn().mockResolvedValue(undefined),
            notifyAdminsNewOrder: jest.fn(),
            dispatchToUser: jest.fn(),
          },
        },
        { provide: CartService, useValue: {} },
        { provide: CouponService, useValue: {} },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
