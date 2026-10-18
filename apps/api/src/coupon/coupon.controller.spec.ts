import { Test, TestingModule } from '@nestjs/testing';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('CouponController', () => {
  let controller: CouponController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CouponController],
      providers: [
        CouponService,
        { provide: PrismaService, useValue: {} },
        {
          provide: NotificationsDispatchService,
          useValue: {
            notifyResourceMutation: jest.fn().mockResolvedValue(undefined),
            notifyPortalUsers: jest.fn().mockResolvedValue(undefined),
            notifyAdminsNewOrder: jest.fn(),
            dispatchToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CouponController>(CouponController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
