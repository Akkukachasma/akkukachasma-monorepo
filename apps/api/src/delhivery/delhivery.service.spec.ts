import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosHeaders, AxiosResponse } from 'axios';
import { DelhiveryService } from './delhivery.service';
import { PrismaService } from '../prisma/prisma.service';
import { ActivityLoggerService } from '../activity/activity-logger.service';
import { ERR_TYPES } from '../../lib/constants';
import { createMockConfigService } from '../test/mock-config.service';

const mockActivityLogger = () => ({
  logError: jest.fn(),
  logWarning: jest.fn(),
  logSuccess: jest.fn(),
  logAlert: jest.fn(),
  logInfo: jest.fn(),
});

describe('DelhiveryService pincode serviceability', () => {
  let service: DelhiveryService;
  let httpService: { get: jest.Mock };

  const pin = '110001';

  const mockDeliveryCodes = (opts: {
    prepaid?: string;
    cod?: string;
    empty?: boolean;
    city?: string;
    district?: string;
    state_code?: string;
    usePrePaidKey?: boolean;
  }) => {
    if (opts.empty) {
      return { delivery_codes: [] };
    }
    const flagKey = opts.usePrePaidKey ? 'pre_paid' : 'prepaid';
    return {
      delivery_codes: [
        {
          postal_code: {
            pin,
            [flagKey]: opts.prepaid ?? 'Y',
            cod: opts.cod ?? 'N',
            city: opts.city,
            district: opts.district,
            state_code: opts.state_code,
          },
        },
      ],
    };
  };

  const axiosOk = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  beforeEach(async () => {
    httpService = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelhiveryService,
        {
          provide: ConfigService,
          useValue: createMockConfigService({
            DELIVERY_API_KEY: 'test-token',
            PINCODE_SERVICEABILITY_URL:
              'https://example.test/c/api/pin-codes/json/',
          }),
        },
        { provide: HttpService, useValue: httpService },
        { provide: PrismaService, useValue: {} },
        { provide: ActivityLoggerService, useValue: mockActivityLogger() },
      ],
    }).compile();

    service = module.get(DelhiveryService);
  });

  describe('checkPincodeServiceability', () => {
    it('returns prepaid/cod flags when Delhivery answers', async () => {
      httpService.get.mockReturnValue(
        of(axiosOk(mockDeliveryCodes({ prepaid: 'Y', cod: 'Y' }))),
      );

      await expect(service.checkPincodeServiceability(pin)).resolves.toEqual(
        expect.objectContaining({
          status: 'ok',
          prepaid: true,
          cod: true,
        }),
      );
      expect(httpService.get).toHaveBeenCalledWith(
        expect.stringContaining(`filter_codes=${pin}`),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Token test-token',
          }),
        }),
      );
    });

    it('parses pre_paid and returns city/state from Delhivery', async () => {
      httpService.get.mockReturnValue(
        of(
          axiosOk(
            mockDeliveryCodes({
              prepaid: 'Y',
              cod: 'Y',
              usePrePaidKey: true,
              city: 'Delhi',
              district: 'New Delhi',
              state_code: 'DL',
            }),
          ),
        ),
      );

      await expect(service.checkPincodeServiceability(pin)).resolves.toEqual(
        expect.objectContaining({
          status: 'ok',
          prepaid: true,
          cod: true,
          city: 'Delhi',
          district: 'New Delhi',
          stateCode: 'DL',
          state: 'Delhi',
        }),
      );
    });

    it('returns prepaid false / cod false when flags are N', async () => {
      httpService.get.mockReturnValue(
        of(axiosOk(mockDeliveryCodes({ prepaid: 'N', cod: 'N' }))),
      );

      await expect(service.checkPincodeServiceability(pin)).resolves.toEqual(
        expect.objectContaining({
          status: 'ok',
          prepaid: false,
          cod: false,
        }),
      );
    });

    it('treats empty delivery_codes as not serviceable (ok + false)', async () => {
      httpService.get.mockReturnValue(
        of(axiosOk(mockDeliveryCodes({ empty: true }))),
      );

      await expect(service.checkPincodeServiceability(pin)).resolves.toEqual({
        status: 'ok',
        prepaid: false,
        cod: false,
      });
    });

    it('returns unavailable on HTTP 5xx without throwing', async () => {
      const error = new AxiosError('Server Error');
      error.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: {},
        headers: {},
        config: { headers: new AxiosHeaders() },
      };
      httpService.get.mockReturnValue(throwError(() => error));

      await expect(service.checkPincodeServiceability(pin)).resolves.toEqual({
        status: 'unavailable',
        reason: expect.any(String),
      });
    });

    it('returns unavailable on timeout without throwing', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new AxiosError('timeout of 10000ms exceeded')),
      );

      const result = await service.checkPincodeServiceability(pin);
      expect(result.status).toBe('unavailable');
    });

    it('returns unavailable when not configured', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          DelhiveryService,
          {
            provide: ConfigService,
            useValue: createMockConfigService({
              DELIVERY_API_KEY: '',
              PINCODE_SERVICEABILITY_URL: '',
            }),
          },
          { provide: HttpService, useValue: httpService },
          { provide: PrismaService, useValue: {} },
          { provide: ActivityLoggerService, useValue: mockActivityLogger() },
        ],
      }).compile();

      const unconfigured = module.get(DelhiveryService);
      await expect(unconfigured.checkPincodeServiceability(pin)).resolves.toEqual(
        {
          status: 'unavailable',
          reason: 'Delhivery serviceability is not configured',
        },
      );
      expect(httpService.get).not.toHaveBeenCalled();
    });
  });

  describe('assertPincodeDeliverable', () => {
    it('returns verified when prepaid is available', async () => {
      httpService.get.mockReturnValue(
        of(axiosOk(mockDeliveryCodes({ prepaid: 'Y', cod: 'N' }))),
      );

      await expect(
        service.assertPincodeDeliverable(pin),
      ).resolves.toBe('verified');
    });

    it('hard-rejects when not prepaid', async () => {
      httpService.get.mockReturnValue(
        of(axiosOk(mockDeliveryCodes({ prepaid: 'N', cod: 'N' }))),
      );

      await expect(service.assertPincodeDeliverable(pin)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      try {
        await service.assertPincodeDeliverable(pin);
      } catch (e) {
        const body = (e as BadRequestException).getResponse() as Record<
          string,
          unknown
        >;
        expect(body.message).toMatch(/Delivery is not available/i);
        expect(body.type).not.toBe(
          ERR_TYPES.pincode_serviceability_unavailable,
        );
      }
    });

    it('hard-rejects COD when requireCod and COD is N', async () => {
      httpService.get.mockReturnValue(
        of(axiosOk(mockDeliveryCodes({ prepaid: 'Y', cod: 'N' }))),
      );

      await expect(
        service.assertPincodeDeliverable(pin, { requireCod: true }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws typed unavailable when API down and not acknowledged', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new AxiosError('timeout')),
      );

      await expect(
        service.assertPincodeDeliverable(pin, {
          allowUnverified: true,
          acknowledgeUnverified: false,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      try {
        await service.assertPincodeDeliverable(pin, {
          allowUnverified: true,
          acknowledgeUnverified: false,
        });
      } catch (e) {
        const body = (e as BadRequestException).getResponse() as Record<
          string,
          unknown
        >;
        expect(body.type).toBe(ERR_TYPES.pincode_serviceability_unavailable);
        expect(body.code).toBe(ERR_TYPES.pincode_serviceability_unavailable);
      }
    });

    it('returns unverified when API down and acknowledge soft path', async () => {
      httpService.get.mockReturnValue(
        throwError(() => new AxiosError('timeout')),
      );

      await expect(
        service.assertPincodeDeliverable(pin, {
          allowUnverified: true,
          acknowledgeUnverified: true,
        }),
      ).resolves.toBe('unverified');
    });
  });
});

describe('DelhiveryService createShipment (manifest)', () => {
  let service: DelhiveryService;
  let httpService: { get: jest.Mock; post: jest.Mock };
  let activityLogger: ReturnType<typeof mockActivityLogger>;
  let prisma: PrismaService;

  const manifestUrl = 'https://staging-express.delhivery.com/api/cmu/create.json';
  const order = {
    id: 'order123',
    user: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      phone_number: '9876543210',
    },
    address: {
      address: '12 Main #Street & Lane',
      city: 'Delhi',
      state: 'Delhi',
      zip_code: '110001',
    },
    payment: { mode: 'online' },
    pricing: { total: 999 },
    order_items: [
      {
        product_color: {
          model_number: 'M1',
          product: { model_name: 'Frame %One' },
        },
        quantity: 1,
        price: 999,
      },
    ],
  };

  const axiosOk = <T>(data: T): AxiosResponse<T> => ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

  beforeEach(async () => {
    httpService = { get: jest.fn(), post: jest.fn() };
    activityLogger = mockActivityLogger();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DelhiveryService,
        {
          provide: ConfigService,
          useValue: createMockConfigService({
            DELIVERY_API_KEY: 'test-token',
            MANIFEST_ORDER_API: manifestUrl,
            DELIVERY_PICKUP_LOCATION: 'AKKUKACHASMACOM SURFACE',
            DELIVERY_CLIENT_NAME: 'AKKUKACHASMACOM SURFACE',
          }),
        },
        { provide: HttpService, useValue: httpService },
        {
          provide: PrismaService,
          useValue: {
            companyInfo: {
              findFirst: jest.fn().mockResolvedValue({ gstin: '22AAAAA0000A1Z5' }),
            },
            invoiceTax: {
              findFirst: jest.fn().mockResolvedValue({ hsn_code: '9004' }),
            },
            invoice: {
              findUnique: jest.fn().mockResolvedValue(null),
            },
          },
        },
        { provide: ActivityLoggerService, useValue: activityLogger },
      ],
    }).compile();

    service = module.get(DelhiveryService);
    prisma = module.get(PrismaService);
  });

  it('POSTs to MANIFEST_ORDER_API with pickup_location, client, separated address, Prepaid', async () => {
    httpService.post.mockReturnValue(
      of(
        axiosOk({
          success: true,
          packages: [{ waybill: 'WB123', remarks: [] }],
        }),
      ),
    );

    const result = await service.createShipment(order as any);

    expect(result.waybill_number).toBe('WB123');
    expect(httpService.post).toHaveBeenCalledWith(
      manifestUrl,
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Token test-token',
          'Content-Type': 'application/x-www-form-urlencoded',
        }),
      }),
    );

    const body = httpService.post.mock.calls[0][1] as string;
    const params = new URLSearchParams(body);
    expect(params.get('format')).toBe('json');
    const data = JSON.parse(params.get('data') || '{}');

    expect(data.pickup_location).toEqual({ name: 'AKKUKACHASMACOM SURFACE' });
    expect(data.client).toBe('AKKUKACHASMACOM SURFACE');
    expect(data.shipments).toHaveLength(1);
    expect(data.shipments[0]).toEqual(
      expect.objectContaining({
        add: '12 Main Street Lane',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        pin: '110001',
        phone: '9876543210',
        payment_mode: 'Prepaid',
        order: 'order123',
        seller_inv: 'INV-order123',
        total_amount: 999,
      }),
    );
    expect(data.shipments[0].add).not.toMatch(/[&#%;\\]/);
    expect(data.shipments[0].products).not.toMatch(/%/);
    expect(activityLogger.logSuccess).toHaveBeenCalled();

    const rawData = params.get('data') || '';
    expect(rawData).toContain('"weight":350.00');
    expect(rawData).toContain('"shipment_length":17.00');
    expect(rawData).toContain('"shipment_width":12.00');
    expect(rawData).toContain('"shipment_height":8.00');
  });

  it('uses orderId__invoiceSlug and real seller_inv when invoice exists', async () => {
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({
      invoice_number: 'AKC/26-27/29',
      status: 'paid',
      issued_date: new Date('2026-07-26T10:00:00.000Z'),
      created_at: new Date('2026-07-26T10:00:00.000Z'),
    });
    httpService.post.mockReturnValue(
      of(
        axiosOk({
          success: true,
          packages: [{ waybill: 'WBINV', remarks: [] }],
        }),
      ),
    );

    await service.createShipment(order as any);

    const body = httpService.post.mock.calls[0][1] as string;
    const data = JSON.parse(new URLSearchParams(body).get('data') || '{}');
    expect(data.shipments[0].order).toBe('order123__AKC-26-27-29');
    expect(data.shipments[0].seller_inv).toBe('AKC-26-27-29');
    expect(data.shipments[0].seller_inv_date).toBe('2026-07-26');
  });

  it('strips Delhivery-forbidden chars from invoice slug', async () => {
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({
      invoice_number: 'AKC/26-27/29#A%',
      status: 'paid',
      issued_date: new Date('2026-07-26T10:00:00.000Z'),
      created_at: new Date('2026-07-26T10:00:00.000Z'),
    });
    httpService.post.mockReturnValue(
      of(
        axiosOk({
          success: true,
          packages: [{ waybill: 'WBSAN', remarks: [] }],
        }),
      ),
    );

    await service.createShipment(order as any);

    const body = httpService.post.mock.calls[0][1] as string;
    const data = JSON.parse(new URLSearchParams(body).get('data') || '{}');
    expect(data.shipments[0].order).toBe('order123__AKC-26-27-29A');
    expect(data.shipments[0].seller_inv).toBe('AKC-26-27-29A');
  });

  it('falls back to legacy order/seller_inv when invoice is void', async () => {
    (prisma.invoice.findUnique as jest.Mock).mockResolvedValue({
      invoice_number: 'AKC/26-27/29',
      status: 'void',
      issued_date: new Date('2026-07-26T10:00:00.000Z'),
      created_at: new Date('2026-07-26T10:00:00.000Z'),
    });
    httpService.post.mockReturnValue(
      of(
        axiosOk({
          success: true,
          packages: [{ waybill: 'WBVOID', remarks: [] }],
        }),
      ),
    );

    await service.createShipment(order as any);

    const body = httpService.post.mock.calls[0][1] as string;
    const data = JSON.parse(new URLSearchParams(body).get('data') || '{}');
    expect(data.shipments[0].order).toBe('order123');
    expect(data.shipments[0].seller_inv).toBe('INV-order123');
  });

  it('uses COD payment_mode and cod_amount for COD orders', async () => {
    httpService.post.mockReturnValue(
      of(
        axiosOk({
          success: true,
          packages: [{ waybill: 'WBCOD', remarks: [] }],
        }),
      ),
    );

    await service.createShipment({
      ...order,
      payment: { mode: 'cod' },
      pricing: { total: 450.5 },
    } as any);

    const body = httpService.post.mock.calls[0][1] as string;
    const data = JSON.parse(new URLSearchParams(body).get('data') || '{}');
    expect(data.shipments[0].payment_mode).toBe('COD');
    expect(data.shipments[0].cod_amount).toBe(450.5);
    expect(data.shipments[0].total_amount).toBe(450.5);
  });

  it('throws and logs when Delhivery returns success false', async () => {
    httpService.post.mockReturnValue(
      of(
        axiosOk({
          success: false,
          packages: [{ remarks: ['ClientWarehouse matching query doesn\'t exist'] }],
          rmks: 'failed',
        }),
      ),
    );

    await expect(service.createShipment(order as any)).rejects.toThrow(
      /ClientWarehouse|failed/i,
    );
    expect(activityLogger.logError).toHaveBeenCalled();
  });

  it('throws on HTTP error with response body instrumentation', async () => {
    const error = new AxiosError('Request failed');
    error.response = {
      status: 401,
      statusText: 'Unauthorized',
      data: { rmks: 'Login or API Key Required' },
      headers: {},
      config: { headers: new AxiosHeaders() },
    };
    httpService.post.mockReturnValue(throwError(() => error));

    await expect(service.createShipment(order as any)).rejects.toThrow(
      /Login or API Key Required/i,
    );
    expect(activityLogger.logError).toHaveBeenCalled();
  });
});
