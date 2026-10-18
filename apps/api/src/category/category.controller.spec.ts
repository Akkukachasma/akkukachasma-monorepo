import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductService } from '../product/product.service';
import { WishlistService } from '../wishlist/wishlist.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  const mockService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: {} },
        { provide: ProductService, useValue: mockService },
        { provide: WishlistService, useValue: mockService },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
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

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
