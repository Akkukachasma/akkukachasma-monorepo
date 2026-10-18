import { Test, TestingModule } from '@nestjs/testing';
import { ShapeController } from './shape.controller';
import { ShapeService } from './shape.service';
import { PrismaService } from '../prisma/prisma.service';
import { FileService } from '../file/file.service';
import { BucketService } from '../bucket/bucket.service';
import { ProductService } from '../product/product.service';
import { WishlistService } from '../wishlist/wishlist.service';
import { NotificationsDispatchService } from '../notifications/notifications-dispatch.service';

describe('ShapeController', () => {
  let controller: ShapeController;
  const mockService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShapeController],
      providers: [
        ShapeService,
        { provide: PrismaService, useValue: {} },
        { provide: FileService, useValue: {} },
        { provide: BucketService, useValue: {} },
        { provide: ProductService, useValue: mockService },
        { provide: WishlistService, useValue: mockService },
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

    controller = module.get<ShapeController>(ShapeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
