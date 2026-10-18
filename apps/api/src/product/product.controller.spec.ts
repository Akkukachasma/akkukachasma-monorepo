import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { BucketService } from '../bucket/bucket.service';
import { WishlistService } from '../wishlist/wishlist.service';
import { PopularityService } from '../popularity/popularity.service';
import { ProductColorEmbeddingService } from '../product-color-embedding/product-color-embedding.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';
import { ProductPriceAdjustmentService } from './product-price-adjustment.service';

describe('ProductController', () => {
  let controller: ProductController;
  const mockWishlistService = {};
  const mockPopularityService = { recordView: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        { provide: PrismaService, useValue: {} },
        { provide: BucketService, useValue: {} },
        { provide: WishlistService, useValue: mockWishlistService },
        { provide: PopularityService, useValue: mockPopularityService },
        {
          provide: ProductColorEmbeddingService,
          useValue: { serialize: jest.fn((x: unknown) => x) },
        },
        {
          provide: NotificationsDispatchService,
          useValue: {
            notifyResourceMutation: jest.fn().mockResolvedValue(undefined),
            notifyPortalUsers: jest.fn().mockResolvedValue(undefined),
            notifyAdminsNewOrder: jest.fn(),
            dispatchToUser: jest.fn(),
          },
        },
        {
          provide: ProductPriceAdjustmentService,
          useValue: {
            createAdjustment: jest.fn(),
            listAdjustments: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
