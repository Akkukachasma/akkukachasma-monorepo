import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { ActivityLoggerService } from '../activity/activity-logger.service';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'RAZORPAY_KEY' || key === 'RAZORPAY_SECRET') return 'test-key';
      return undefined;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ActivityLoggerService, useValue: { logError: jest.fn() } },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
