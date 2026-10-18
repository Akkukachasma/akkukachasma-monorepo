import { ConflictException, BadRequestException } from '@nestjs/common';
import { PriceAdjustmentStatus } from '@prisma/client';
import { ProductPriceAdjustmentService } from './product-price-adjustment.service';
import { CreatePriceAdjustmentDto } from './dto/create-price-adjustment.dto';
import {
  PriceAdjustmentDirection,
  PriceAdjustmentMode,
} from '@prisma/client';

describe('ProductPriceAdjustmentService (background)', () => {
  const prisma = {
    productPriceAdjustment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    productPriceAdjustmentItem: {
      createMany: jest.fn(),
    },
  };

  const activityLogger = {
    logSuccess: jest.fn(),
    logError: jest.fn(),
  };

  let service: ProductPriceAdjustmentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductPriceAdjustmentService(
      prisma as any,
      activityLogger as any,
    );
  });

  const dto: CreatePriceAdjustmentDto = {
    direction: PriceAdjustmentDirection.increase,
    mode: PriceAdjustmentMode.percentage,
    value: 10,
  };

  it('rejects when another adjustment is in progress', async () => {
    prisma.productPriceAdjustment.findFirst.mockResolvedValue({
      id: 'adj1',
      status: PriceAdjustmentStatus.processing,
    });

    await expect(service.createAdjustment('admin1', dto)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(prisma.productPriceAdjustment.create).not.toHaveBeenCalled();
  });

  it('rejects when there are no products', async () => {
    prisma.productPriceAdjustment.findFirst.mockResolvedValue(null);
    prisma.product.count.mockResolvedValue(0);

    await expect(service.createAdjustment('admin1', dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('creates a pending batch and returns immediately', async () => {
    prisma.productPriceAdjustment.findFirst.mockResolvedValue(null);
    prisma.product.count.mockResolvedValue(120);
    prisma.productPriceAdjustment.create.mockResolvedValue({
      id: 'adj-new',
      status: PriceAdjustmentStatus.pending,
    });
    prisma.productPriceAdjustment.update.mockResolvedValue({});
    prisma.product.findMany.mockResolvedValue([]);
    prisma.productPriceAdjustmentItem.createMany.mockResolvedValue({ count: 0 });

    const result = await service.createAdjustment('admin1', dto);

    expect(result).toMatchObject({
      adjustment_id: 'adj-new',
      status: PriceAdjustmentStatus.pending,
      products_total: 120,
      products_updated: 0,
    });
    expect(prisma.productPriceAdjustment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: PriceAdjustmentStatus.pending,
          products_total: 120,
          created_by_id: 'admin1',
        }),
      }),
    );
    // Heavy product updates must not run inline before return
    expect(prisma.product.update).not.toHaveBeenCalled();

    // Let the queued setImmediate job finish without leaking unhandled work
    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));
  });
});
