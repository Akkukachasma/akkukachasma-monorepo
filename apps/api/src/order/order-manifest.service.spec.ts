import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@prisma/client';
import { OrderManifestService } from './order-manifest.service';
import { PrismaService } from '../prisma/prisma.service';
import { DelhiveryService } from '../delhivery/delhivery.service';
import { OrderService } from './order.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ActivityLoggerService } from '../activity/activity-logger.service';

describe('OrderManifestService', () => {
  let service: OrderManifestService;
  const emitToUser = jest.fn();
  const createShipment = jest.fn();
  const upsertOrderShipmentDetails = jest.fn();
  const findUniqueOrder = jest.fn();
  const findUniqueShipment = jest.fn();
  const logSuccess = jest.fn();
  const logError = jest.fn();

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderManifestService,
        {
          provide: PrismaService,
          useValue: {
            order: { findUnique: findUniqueOrder },
            orderShipmentDetails: { findUnique: findUniqueShipment },
          },
        },
        {
          provide: DelhiveryService,
          useValue: { createShipment },
        },
        {
          provide: OrderService,
          useValue: { upsertOrderShipmentDetails },
        },
        {
          provide: NotificationsGateway,
          useValue: { emitToUser },
        },
        {
          provide: ActivityLoggerService,
          useValue: { logSuccess, logError },
        },
      ],
    }).compile();

    service = module.get(OrderManifestService);
  });

  it('returns job_id and accepts unique order ids', () => {
    const result = service.startManifestJob({
      orderIds: ['a', 'a', 'b'],
      adminUserId: 'admin1',
    });
    expect(result.job_id).toBeTruthy();
    expect(result.accepted).toBe(2);
  });

  it('skips orders that already have a waybill', async () => {
    findUniqueOrder.mockResolvedValue({
      id: 'o1',
      status: OrderStatus.confirmed,
      address: { address: '1 Main St', city: 'X', state: 'Y', zip_code: '110001' },
      shipment_details: { waybill_number: 'WB1' },
      user: { id: 'u', name: 'A', email: 'a@b.com', phone_number: '1' },
      payment: { mode: 'cod' },
      pricing: { total: 100 },
      order_items: [],
    });

    const { job_id } = service.startManifestJob({
      orderIds: ['o1'],
      adminUserId: 'admin1',
    });

    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setTimeout(r, 50));

    expect(createShipment).not.toHaveBeenCalled();
    expect(emitToUser).toHaveBeenCalledWith(
      'admin1',
      'orders:manifest:progress',
      expect.objectContaining({
        job_id,
        order_id: 'o1',
        status: 'skipped',
      }),
    );
  });

  it('retries on network error then succeeds', async () => {
    findUniqueOrder.mockResolvedValue({
      id: 'o1',
      status: OrderStatus.confirmed,
      address: { address: '1 Main St', city: 'X', state: 'Y', zip_code: '110001' },
      shipment_details: null,
      user: { id: 'u', name: 'A', email: 'a@b.com', phone_number: '1' },
      payment: { mode: 'cod' },
      pricing: { total: 100 },
      order_items: [],
    });
    findUniqueShipment.mockResolvedValue(null);
    createShipment
      .mockRejectedValueOnce({ code: 'ETIMEDOUT', message: 'timeout' })
      .mockResolvedValueOnce({
        waybill_number: 'WB99',
        tracking_url: 'https://track/WB99',
        estimated_delivery: new Date(),
      });
    upsertOrderShipmentDetails.mockResolvedValue({});

    const { job_id } = service.startManifestJob({
      orderIds: ['o1'],
      adminUserId: 'admin1',
    });

    await new Promise((r) => setTimeout(r, 1200));

    expect(createShipment).toHaveBeenCalledTimes(2);
    expect(upsertOrderShipmentDetails).toHaveBeenCalledWith(
      expect.objectContaining({
        order_id: 'o1',
        waybill_number: 'WB99',
      }),
    );
    expect(emitToUser).toHaveBeenCalledWith(
      'admin1',
      'orders:manifest:progress',
      expect.objectContaining({
        job_id,
        order_id: 'o1',
        status: 'success',
        waybill_number: 'WB99',
      }),
    );
  });

  it('does not retry permanent Delhivery rejection', async () => {
    findUniqueOrder.mockResolvedValue({
      id: 'o1',
      status: OrderStatus.confirmed,
      address: { address: '1 Main St', city: 'X', state: 'Y', zip_code: '110001' },
      shipment_details: null,
      user: { id: 'u', name: 'A', email: 'a@b.com', phone_number: '1' },
      payment: { mode: 'cod' },
      pricing: { total: 100 },
      order_items: [],
    });
    findUniqueShipment.mockResolvedValue(null);
    createShipment.mockRejectedValue(
      new Error('ClientWarehouse matching query does not exist.'),
    );

    service.startManifestJob({
      orderIds: ['o1'],
      adminUserId: 'admin1',
    });

    await new Promise((r) => setTimeout(r, 100));

    expect(createShipment).toHaveBeenCalledTimes(1);
    expect(emitToUser).toHaveBeenCalledWith(
      'admin1',
      'orders:manifest:progress',
      expect.objectContaining({
        order_id: 'o1',
        status: 'failed',
      }),
    );
  });
});
