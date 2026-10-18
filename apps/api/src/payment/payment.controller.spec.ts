import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { InventoryService } from '../inventory/inventory.service';
import { InvoiceService } from '../invoice/invoice.service';
import { DelhiveryService } from '../delhivery/delhivery.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { CompanyInfoService } from '../setting/company-info/company-info.service';

describe('PaymentController', () => {
  let controller: PaymentController;
  const mockService = {};

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'RAZORPAY_KEY' || key === 'RAZORPAY_SECRET') return 'test-key';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        PaymentService,
        { provide: OrderService, useValue: mockService },
        { provide: PrismaService, useValue: {} },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: InventoryService, useValue: mockService },
        { provide: InvoiceService, useValue: mockService },
        { provide: DelhiveryService, useValue: mockService },
        { provide: ActivityLoggerService, useValue: { logError: jest.fn() } },
        {
          provide: NotificationsDispatchService,
          useValue: {
            notifyResourceMutation: jest.fn().mockResolvedValue(undefined),
            notifyPortalUsers: jest.fn().mockResolvedValue(undefined),
            notifyAdminsNewOrder: jest.fn(),
            dispatchToUser: jest.fn(),
          },
        },
        { provide: CompanyInfoService, useValue: { isCodEnabled: jest.fn() } },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
